<?php

/*
	Helper for interfacing with socket based Web Api. One major issue is that server gives back inconsistent
	results for the bar timestamp. It is not UTC like it should be, instead it is a timestamp of
	the server time + daylight savings time at the servers time. This is a MAJOR issue to watch
	out for.
*/
class SocketServerAPI {
	private $connection = null;
	private $errno = '';
	private $errstr = '';
 	private $host;
	private $port;
	private $timeout = '5';

	function __construct($host, $port) {
		$this->host = $host;
		$this->port = $port;
	}

	function __destruct() {

	}

	public function get_history($symbol, $period, $from, $to) {
		$result = array("header" => array(), "bars" => array());
		$m_from = strtotime($from);
		$m_to = strtotime($to);
		$query_format = 'HISTORYNEW-symbol=%s|period=%d|from=%d|to=%d';
		$timeout = 600;
		$start = microtime(true);

		// because the server won't give back more than ~580 results per request, lets calculate how many
		// bars will return at max based on the time period and the timeframe (from -> to), then break
		// it up into multiple requests
		// since period is based on minutes and the timeframe is based on seconds, lets convert
		$timeframe_minutes = ($m_to - $m_from)/60;
		$max_bars = $timeframe_minutes/$period;
		if($max_bars > 580) {
			$timeframe_adjust = 580 * $period * 60;
			$temp_from = $m_to - $timeframe_adjust;
			$temp_to = $m_to;
			$last_received_time = 0;
			while(1) {
				if(microtime(true) - $start > $timeout) break;

				$ret = $this->mt_query(sprintf($query_format, $symbol, $period, $temp_from, $temp_to));

				//unpack the first four bytes. If they're zero it means we've got an invalid result, so skip it
				//this is an educated guess, unfortunately the interface to mt4 is very poorly defined
				$test = @unpack('itest', $ret);
				if($test["test"] === 0) break;

				//this checks if we fail to get more data. If we are missing more data than a weekend
				//then we have probably gone past the limit of the server and should just break out
				$test2 = @unpack('icheck1', $ret);
				// 2 (^B^@^@^@, 0x2000), seems to be the code for no data for time period?
				if($test2["check1"] == 2) {
					//if the last data recieved was more than 3000 minutes from this try (2 days)
					//then we want to break. This is basically accounting for weekends and, if we keep
					//having missing data, we break out since we aren't going to get any more.
					if(($last_received_time - $temp_to)/60 > 3000) {
						break;
					}
				} else {
					$last_received_time = $temp_from;
				}

				//make sure we have some data before we try to parse and add it
				if($ret) {
					$temp_result = $this->parse_history($ret);
					$result["bars"] = array_merge($result["bars"], $temp_result["bars"]);
				}

				if($temp_from < $m_from) {
					break;
				}
				$temp_from -= $timeframe_adjust;
				$temp_to -= $timeframe_adjust;
			}
		} else {
			$ret = $this->mt_query(sprintf($query_format, $symbol, $period, $m_from, $m_to));
			$test = @unpack('itest', $ret);
			if($test["test"] !== 0) {
				$result = $this->parse_history($ret);
			}
		}
		//echo 'Complete - '.$symbol.' - '.$period.' - '.(microtime(true) - $start)."\n";
		//remove duplicates
		$result["bars"] = array_map("unserialize", array_unique(array_map("serialize", $result["bars"])));

		return $result;
	}

	//takes the pakced byte arrays returned from the mt4 server request and
	//unpacks them into the proper values
	private function parse_history($binary_data) {
		$start      =12;
		$length     =28;
		$history = array();

		$s=substr($binary_data,0,$start);
		
		//break out if we got an empty data set
		if(strlen($s) < 12) return array("header" => array(), "bars" => array());

		$ar_temp=unpack("ibars/idigits/itimesign",$s);
		$digits=$ar_temp["digits"];

		//stupid hack to get around the server's idiotic use of the timestamp in server local time
		//rather than UTC, this is not currently usable as time data is very inconsistent
		// $temp_time = new DateTime('@'.$ar_temp["timesign"]);
		// $actual_date = new DateTime($temp_time->format('Y-m-d H:i:s'), new DateTimeZone($this->mt4_timezone));
		// $ar_temp["timesign"] = $actual_date->getTimestamp();

		$total_len = strlen($binary_data);
		while($start < $total_len) {
			$s = substr($binary_data,$start,$length);
			$history_temp=@unpack("itime/iopen/ihigh/ilow/iclose/dvol",$s);
			$start+=$length;
			if(strlen($s) < 28) {
				continue;
			}

			$history_temp["time"] = $history_temp["time"];
			$history_temp["high"]+=$history_temp["open"];
			//we have to treat these as strings since floating point math results in errors
			$history_temp["high"] = $this->fixed_precision_float($history_temp["high"], $digits);
			$history_temp["low"]+=$history_temp["open"];
			$history_temp["low"] = $this->fixed_precision_float($history_temp["low"], $digits);
			$history_temp["close"] = $history_temp["open"] + $history_temp["close"];
			$history_temp["close"] = $this->fixed_precision_float($history_temp["close"], $digits);
			$history_temp["open"] = $this->fixed_precision_float($history_temp["open"], $digits);
			$history[] = $history_temp;
		}

		return array("header" => $ar_temp, "bars" => $history);
	}

	//converts an integer representation of a float based on number and digits
	//digits are the number of decimal places
	private function fixed_precision_float($num, $digits, $length = 6) {
		$num = str_pad((string)$num, $length, '0', STR_PAD_LEFT);
		$num = substr_replace($num, '.', -$digits, 0);
		return $num;
	}

	private function connect($host, $port, $timeout) {
		$this->connection=@fsockopen($host,$port,$this->errno,$this->errstr,$timeout);
		if(!$this->connection) {
			throw new Exception("Failed to connect to MT4 server: ".$this->errno.'-'.$this->errstr);
		}
	}

	//the server wont return data without the QUIT command, which also
	//closes the connection to the server, forcing us to reopen the connection
	//each time we want to grab more data and then close it again (this would
	//be a hundred times faster if we didn't have to reopen a connection for
	//each request)
	private function mt_query($query) {
		$ret = '';

		$this->connect($this->host, $this->port, $this->timeout);
		//--- If having connected, request and collect the result
		if(fputs($this->connection,"W$query\nQUIT\n")!=FALSE) {
			while(!feof($this->connection)) {
				$ret .= fgets($this->connection);
			}
		} else {
			throw new Exception("Failed to send query: ".$query."\nError: ".$this->errno.'-'.$this->errstr);
		}
		fclose($this->connection);
		//if(strlen($ret) < 40) return '';
		return $ret;
	}
}
