<?php

//since this will probably be a fairly db intensive thing, lets
//setup a simple singleton factory JUST INCASE pooling is required
//later, for now we want a single connection
class ConnectionFactory {
    private static $factory;

    private function __construct() {

    }

    public static function get_factory()
    {
        if (!self::$factory)
            self::$factory = new ConnectionFactory();
        return self::$factory;
    }

    private $db;

    public function get_connection($host, $user, $pass, $db) {
        if (!$this->db)
            $this->db = new Database($host, $user, $pass, $db);
        return $this->db;
    }
}

class Database {
	private $conn;
	private $user;
	private $pass;
	private $dsn;
	private $curr_query;
	private $curr_stmt;

	public function __construct($host, $user, $pass, $db) {
		$this->user = $user;
		$this->pass = $pass;
		$this->dsn = 'mysql:dbname='.$db.';host='.$host;
	}

	public function get_assoc($query, $params = array()) {
		$this->_execute($query, $params);
		return $this->curr_stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	public function get_array($query, $params = array()) {
		$this->_execute($query, $params);
		return $this->curr_stmt->fetchAll(PDO::FETCH_NUM);
	}

	public function get_row($query, $params = array()) {
		$this->_execute($query, $params);
		return $this->curr_stmt->fetch(PDO::FETCH_ASSOC);
	}

	public function get_one($query, $params = array()) {
		$this->_execute($query, $params);	
		return $this->curr_stmt->fetchColumn();
	}

	public function execute($query, $params = array()) {
		$this->_execute($query, $params);
	}

	public function get_last_insert_id() {
		return $this->conn->lastInsertId();
	}

	//according to the PDO docs on php.net this is a rather unreliable count, use
	//responsibly
	public function get_affected_rows() {
		if($this->curr_stmt) {
			return $this->curr_stmt->rowCount();
		} else {
			return 0;
		}
	}

	private function connect() {
		$this->conn = new PDO($this->dsn, $this->user, $this->pass);
	}

	private function _execute($query, $params = array()) {
		if(!$this->conn) {
			$this->connect();
		}

		if($this->curr_query != $query) {
			$this->curr_query = $query;
			$this->curr_stmt = $this->conn->prepare($query);
		}

		$this->curr_stmt->execute($params);
	}
}