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

//placeholder secret, in actual practice this would be generated per user we wanted
//to give access to the api
const API_SECRET = 'tombom';

class WPAPIPlugin {

    protected $api_prefix = 'wp-auth-api';

    public function install() {
        $this->init();
        flush_rewrite_rules(true);
    }

    public function uninstall() {
        flush_rewrite_rules(true);
    }

    public function run() {
        //watch for endpoint requests
        add_action('parse_request', array($this, 'watch_requests'), 0);
        add_action('init', array($this, 'init'));

        add_filter('query_vars', function($qv) {
            $qv[] = 'api_endpoint';
            return $qv;
        });
    }

    public function init() {
        add_rewrite_rule("^{$this->api_prefix}/([a-zA-Z]+)/?", 'index.php?api_endpoint=$matches[1]', 'top');
    }

    /**
    * Listen for requests to our endpoint
    */
    public function watch_requests($wp) {
        $endpoint = $wp->query_vars['api_endpoint'];
        if($endpoint) {
            //parse our incoming request data
            $req = json_decode(file_get_contents('php://input'));
            $response = array(
                'errors' => array()
            );

            //make sure the request is coming from a trusted source
            if($this->validate_api_secret($req->secret)) {
                switch($endpoint) {
                    case 'login':
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
        return $query;
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
        $user = get_user_by( 'login', $data->username );
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

    protected static $instance = NULL;

    //make sure plugin is singleton in order to handle activation and deactivation properly
    public static function get_instance() {
        NULL === self::$instance && self::$instance = new self;
        return self::$instance;
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

    private function get_auth_cookie($user_id, $expires = false) {
        if(!$expires) {
            //30 days, possibly want a parameter to make this session only
            $expires = time()+30*24*60*60;
        }

        //wordpress uses LOGGED_IN_COOKIE as the auth cookie name,
        //it is defined in wp-includes/default-constants.php
        return array(
            "name" => LOGGED_IN_COOKIE,
            "value" => wp_generate_auth_cookie($user_id, $expires, 'logged_in'),
        );
    }

    private function validate_api_secret($secret) {
        return $secret === API_SECRET;
    }
}
