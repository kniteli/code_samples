<?php

/**
 * Plugin Name: API Authorization & Integration
 * Description: Expose an api for wordpress
 * Author: Roderick Gibson
 * Version: 1.0
 */

defined( 'ABSPATH' ) or die ( 'UNAUTHORIZED' );

/*
api requests take the form:
{
    secret: $api_secret,
    payload: $data,
}
*/
register_activation_hook( __FILE__, array(WPAPIPlugin::get_instance(), 'install'));
register_deactivation_hook( __FILE__, array(WPAPIPlugin::get_instance(), 'uninstall'));
add_action('plugins_loaded', array ( WPAPIPlugin::get_instance(), 'run' ));

class WPAPIPlugin {

	protected static $instance = NULL;

    //make sure plugin is singleton in order to handle activation and deactivation
	public static function get_instance() {
		NULL === self::$instance && self::$instance = new self;
		return self::$instance;
	}

    protected $api_prefix = '/wp-auth-api';

    protected $paths = array(
        'login' => '/login'
    );

    public function install() {

    }

    public function uninstall() {

    }

    public function run() {
        //watch for endpoint requests
        add_action('parse_request', array($this, 'watch_requests'), 0);
    }

    /**
    * Listen for requests to our endpoint
    */
    public function watch_requests() {
        $endpoint = $this->parse_request();
        if($endpoint) {
            //parse our incoming request data
            $req = json_decode(file_get_contents('php://input'));
            $response = array(
                'errors' => array()
            );

            //make sure the request is coming from a trusted source
            if($this->validate_api_secret($req->secret)) {
                switch($endpoint) {
                    case $this->paths['login']:
                        $response = $this->login($req->payload);
                    break;
                    default:
                        $response['errors'][] = 'Invalid endpoint';
                        $this->send_response(400, $response);
                    break;
                }

                //send off validated responses
                $this->send_response(200, $response);
            } else {
                $response['errors'] = array('message' => 'Unauthorized');
                $this->send_response(401, $response);
            }
        }
    }

    /**
    *  login payload params:
    *  {
    *   username: $login_username,
    *   password: $login_password
    *  }
    */
    protected function login($data) {

        $response = array(
            'user_id' => null,
            'auth_cookie' => null,
            'errors' => array()
        );

        $bad_auth_message = "Username or password is incorrect.";
        $user = get_user_by( 'email', $data->username );
        if ( $user ) {
            if(wp_check_password( $data->password, $user->data->user_pass, $user->ID)) {
                $response['user_id'] = $user->ID;
                $response['auth_cookie'] = $this->get_auth_cookie($user->ID);
            } else {
                $response['errors'][] = array('message' => $bad_auth_message);
            }
        } else {
            $response['errors'][] = array('message' => $bad_auth_message);
        }

        return $response;
    }

    /**
    * Send JSON response to client
    * @param  $code => http response code
    * @param $data => response object data
    */
    protected function send_response($code = 200, $data) {
        header('X-PHP-Response-Code: ' . $code, true, $code);
        header('content-type: application/json; charset=utf-8');
        echo json_encode($data)."\n";
        exit;
    }

    private validate_api_secret($secret) {
        return $secret === API_SECRET;
    }

    private function parse_request() {
        $endpoint = false;
        $path = strtok($_SERVER["REQUEST_URI"],'?');
        if ( strrpos($path, $this->api_prefix, -strlen($path)) !== FALSE ) { // path starts with api_prefix
            $endpoint = substr($path, strlen($this->api_prefix));
        }
        return $endpoint;
    }
}
