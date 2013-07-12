<?php

require_once(__DIR__.'/../settings/init.php');
define('LOCK_DIR', $settings->cron->lock_dir);
define('LOCK_SUFFIX', $settings->cron->lock_suffix);

/*
	This class helps figure out which data sets are currently being
	updated will only allow updates on those that aren't. This serializes
	an array to the lock file of the form array(data set => process id)
*/
class CronHelper {

	private static $data = array();

	function __construct() {}

	function __clone() {}

	//compares the given pid to running pids to see if the resolution is still being processed
	private static function isrunning($pid) {
		$pids = explode(PHP_EOL, `ps -e | awk '{print $1}'`);
		if(in_array($pid, $pids))
			return TRUE;
		return FALSE;
	}

	//try to lock add a lock for the given resolution, returns false if
	//it's already being processed
	public static function lock($resolution) {
		global $argv;

		$lock_file = LOCK_DIR.basename($argv[0]).LOCK_SUFFIX;

		if(file_exists($lock_file)) {
			//return FALSE;

			// Is running?
			self::$data = unserialize(file_get_contents($lock_file));
			if(isset(self::$data[$resolution])) {
				if(self::isrunning(self::$data[$resolution])) {
					error_log(date('Y-m-d H:i:s')."==".self::$data[$resolution]." at resolution ".$resolution."== Already in progress...");
					return FALSE;
				}
				else {
					error_log(date('Y-m-d H:i:s')."==".self::$data[$resolution]."== Previous job died abruptly...");
				}
			}
		}

		self::$data[$resolution] = getmypid();
		file_put_contents($lock_file, serialize(self::$data));
		error_log(date('Y-m-d H:i:s')."==".self::$data[$resolution]."== Lock acquired at resolution $resolution, processing the job...");
		return self::$data[$resolution];
	}

	//remove lock for a resolution
	public static function unlock($resolution) {
		global $argv;

		$lock_file = LOCK_DIR.basename($argv[0]).LOCK_SUFFIX;

		//make sure we dont try to unlock non existent file
		if(file_exists($lock_file)) {
			self::$data = unserialize(file_get_contents($lock_file));
			error_log(date('Y-m-d H:i:s')."==".self::$data[$resolution]." at resolution ".$resolution."== Releasing lock...");
			unset(self::$data[$resolution]);

			//if all the resolutions are done processing
			if(empty(self::$data)) {
				unlink($lock_file);
				error_log(date('Y-m-d H:i:s')."== No more locks running == Releasing file...");
			} else {
				file_put_contents($lock_file, serialize(self::$data));
			}
		}

		return TRUE;
	}

}
