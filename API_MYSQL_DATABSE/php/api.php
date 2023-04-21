<?php
// <!-- BRAND RACE -->
    include_once("config.php");
    if($_SERVER['REQUEST_METHOD'] == 'POST'){
        // Storing the Input data in the $json_data variable
        $json_data = file_get_contents('php://input');
        // Now Executing things!!
        $cars_object = new POST_REQUEST($json_data);
    }
    else if($_SERVER['REQUEST_METHOD'] == 'GET'){
        $data = array(
            "limit" => 1
        );
        $data = json_encode($data);
        $cars_object = new POST_REQUEST($data);
    }
    else{
        header("HTTP/1.1 400");
        header("Content-Type: application/json; charset=UTF-8");
        header('Access-Control-Allow-Origin: *');
        $data = [
            "status" => "error",
            "data" => "Error. Bad Request!!"
        ];
        echo json_encode(
            $data
        );
    }
    // *-------------- DONE, API CLASS STARTS HERE --------------
    class POST_REQUEST {
        private $limit = null;
        private $connectionObject = null;
        private $data = null;
        public function __construct($json_data){
            $this->connectionObject = Singleton_Database_Connection::instance();
            // Now Setting the Values from the Post Request
            $this->data = json_decode($json_data, true);
            $this->getBrandsData();
        }
        public function getBrandsData(){
            // * Checking if Required parameters are SET/PRESENT:
            if (!isset($this->data['limit']) || $this->data['limit'] < 0 || $this->data['limit'] > 32){
                $this->data = array(
                    "status" => "error",
                    "data" => "Error. Missing/Invalid 'Limit' Parameter"
                );
                $this->response($this->data);
                return;
            }
            else {
                $this->limit = $this->data['limit'];
                if($_SERVER['REQUEST_METHOD'] == 'GET' && $this->limit == 1){
                    $min = 1;
                    $max = 32;
                    $IDs_Array = $this->generateRandomNumbers($this->limit, $min, $max);
                    $image_and_name = array();
                    $result = $this->connectionObject->get_Image_and_Name($IDs_Array[0]);
                    if($result == false){
                        $this->data = array(
                            "status" => "error",
                            "data" => "Error. An Error has Occurred While Processing the Requests"
                        );
                        $this->response($this->data);
                        return;
                    }
                    else{
                        $data = mysqli_fetch_assoc($result);
                        // echo $data['image_name'];
                        $image_and_name['image_name'] = $data['image_name'];
                        $image_and_name['image_url'] = $data['image_url'];
                        $this->response($image_and_name, 200);
                        return;
                    }
                }
                else{
                    if ($this->limit >= 1 && $this->limit <= 32){
                        $min = 1;
                        $max = 32;
                        $IDs_Array = $this->generateRandomNumbers($this->limit, $min, $max);
                        $BrandsArray = array();
                        $image_and_name = array();
                        foreach($IDs_Array as $count){
                            $result = $this->connectionObject->get_Image_and_Name($count);
                            if($result == false){
                                $this->data = array(
                                    "status" => "error",
                                    "data" => "Error. An Error has Occurred While Processing the Requests"
                                );
                                $this->response($this->data);
                                return;
                            }
                            $data = mysqli_fetch_assoc($result);
                            // echo $data['image_name'];
                            $image_and_name['image_name'] = $data['image_name'];
                            $image_and_name['image_url'] = $data['image_url'];
                            $BrandsArray[] = $image_and_name;
                        }
                        if(count($BrandsArray) == $this->limit){
                            $this->data = array(
                                "status" => "success",
                                "length" => count($BrandsArray),
                                "data" => $BrandsArray
                            );
                            $this->response($this->data, 200);
                            return;
                        }
                    }
                }
            }
        }

        public function generateRandomNumbers($limit, $min, $max) {
            $IDs_Array = array();
            while (count($IDs_Array) < $limit) {
                $random_number = rand($min, $max);
                if (!in_array($random_number, $IDs_Array)) {
                    $IDs_Array[] = $random_number;
                }
            }
            return $IDs_Array;
        }

        // *-------------- RESPONSE Method With Some Headers --------------
        public function response($data, $code = 400){
            header("HTTP/1.1 $code");
            header("Content-Type: application/json; charset=UTF-8");
            header('Access-Control-Allow-Origin: *');
            echo json_encode(
                $data
            );
        }
    }
?>