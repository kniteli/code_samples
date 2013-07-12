<?php

class StockHistoryDB {
	private $db;

	//define the database enums for time periods
	const M1 = 'M1';
	const M5 = 'M5';
	const M15 = 'M15';
	const M30 = 'M30';
	const H1 = 'H1';
	const H4 = 'H4';
	const DAILY = 'DAILY';
	const WEEKLY = 'WEEKLY';
	const MONTHLY = 'MONTHLY';

	public static $period_details = array(
		'M1' 		=> array("minutes" => 1, "max_bars" => 65536),
		'M5' 		=> array("minutes" => 5, "max_bars" => 32768),
		'M15' 		=> array("minutes" => 15, "max_bars" => 16384),
		'M30' 		=> array("minutes" => 30, "max_bars" => 16384),
		'H1' 		=> array("minutes" => 60, "max_bars" => 16384),
		'H4' 		=> array("minutes" => 240, "max_bars" => 16384),
		'DAILY' 	=> array("minutes" => 1440, "max_bars" => 16384),
		'WEEKLY' 	=> array("minutes" => 10080, "max_bars" => 1024),
		'MONTHLY' 	=> array("minutes" => 43200, "max_bars" => 256)
	);

	public static $period_interface_map = array(
		'M1'		=> 'M1',
		'M5'		=> 'M5',
		'M15'		=> 'M15',
		'M30'		=> 'M30',
		'H1'		=> 'H1',
		'H4'		=> 'H4',
		'D1'		=> 'DAILY',
		'W1'		=> 'WEEKLY',
		'MN'		=> 'MONTHLY',
		'AUTO'		=> 'DAILY'
	);

	public static $period_minutes_map = array(
		'M1'		=> '1',
		'M5'		=> '5',
		'M15'		=> '15',
		'M30'		=> '30',
		'H1'		=> '60',
		'H4'		=> '240',
		'D1'		=> '1440',
		'W1'		=> '10080',
		'MN'		=> '43200',
		'AUTO'		=> '1440'
	);

	public function __construct($db) {
		$this->db = $db;
	}

	public function upsert_history($symbol, $bars, $period) {
		$sql = 'INSERT INTO `history_bars`
					(`symbol`, `time`, `resolution`, `open`, `high`, `low`, `close`, `volume`) 
				VALUES
					(?, ?, ?, ?, ?, ?, ? ,?)
				ON DUPLICATE KEY UPDATE
					`open` = VALUES(open),
					`high` = VALUES(high),
					`low` = VALUES(low),
					`close` = VALUES(close),
					`volume` = VALUES(volume)';
		$params = array();
		$values_clauses = array();

		//the pdo driver will optimize the prepared statement here, no need to worry about the loop
		foreach($bars as $bar) {
			$date = new DateTime('@'.$bar["time"]);
			$params = $this->db->execute($sql, array($symbol, $date->format('Y-m-d H:i:s'), $period, $bar["open"], $bar["high"], $bar["low"], $bar["close"], $bar["vol"]));
		}
	}

	public function get_latest_for_period($symbol, $period) {
		$sql = 'SELECT time FROM history_bars
				WHERE symbol = ? AND resolution = ?
				ORDER BY time DESC LIMIT 1';

		return $this->db->get_one($sql, array($symbol, $period));
	}

	public function get_from_beginning($symbol, $resolution, $maximum) {
		$sql = "SELECT time, open, high, low, close 
				FROM history_bars 
				WHERE symbol = ? 
				AND resolution = ?
				ORDER BY time ASC
				LIMIT ".$maximum;

		//high charts requires ascending sorting, we require descending for the limit to work
		//so we flip it before we send it back
		return $this->db->get_array($sql, array($symbol, $resolution));
	}

	public function get_from_end($symbol, $resolution, $maximum) {
		$sql = "SELECT time, open, high, low, close 
				FROM history_bars 
				WHERE symbol = ? 
				AND resolution = ? 
				ORDER BY time DESC
				LIMIT ".$maximum;

		//high charts requires ascending sorting, we require descending for the limit to work
		//so we flip it before we send it back
		return array_reverse($this->db->get_array($sql, array($symbol, $resolution)));		
	}

	public function get_earliest_for_period($symbol, $period) {
		$sql = 'SELECT time FROM history_bars
		WHERE symbol = ? AND resolution = ?
		ORDER BY time ASC LIMIT 1';

		return $this->db->get_one($sql, array($symbol, $period));
	}

	public function get_all() {
		$sql = 'SELECT * FROM history_bars';
		return $this->db->get_assoc($sql);
	}

	public function get_all_symbol_for_display($symbol, $resolution, $maximum) {
		$sql = "SELECT time, open, high, low, close 
				FROM history_bars 
				WHERE symbol = ? 
				AND resolution = ? 
				ORDER BY time DESC
				LIMIT ".$maximum;

		//high charts requires ascending sorting, we require descending for the limit to work
		//so we flip it before we send it back
		return array_reverse($this->db->get_array($sql, array($symbol, $resolution)));
	}

	public function get_all_symbol_for_display_by_time($symbol, $resolution, $from, $until, $maximum) {
		$sql = "SELECT time, open, high, low, close 
				FROM history_bars 
				WHERE symbol = ? AND resolution = ? AND time BETWEEN ? AND ? 
				ORDER BY time DESC
				LIMIT ".$maximum;

		//high charts requires ascending sorting, we require descending for the limit to work
		//so we flip it before we send it back
		return array_reverse($this->db->get_array($sql, array($symbol, $resolution, $from, $until)));		
	}
}
