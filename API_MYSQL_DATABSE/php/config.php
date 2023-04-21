<?php
    class Singleton_Database_Connection
    {
        private $Host = "localhost";
        private $DatabaseName = "brands_database";
        private $Username = "root";
        private $Password = "";
        private $brands_table = "brands";
        private $initConnection = null;

        public static function instance()
        {
            static $instance = null;
            if ($instance === null){
                $instance = new Singleton_Database_Connection();
            }
            return $instance;
        }

        // Method for Closing the database connection
        private function close($connection) {
            $connection->close();
        }

        // The Constructor for the Singleton_Database_Connection class
        private function __construct() // connecting to the db using environment variables in .env file
        {
            if ($this->initConnection !== null)
            {
                if (mysqli_ping($this->initConnection))
                {
                    $this->initConnection->close();
                }
            }
            // Initializing the Connection object
            $this->initConnection = new mysqli($this->Host, $this->Username, $this->Password);
            // Checking if Connection was successful
            if ($this->initConnection->connect_error){
                die("Connection to the Database failed: " . $this->initConnection->connect_error);
            }
            else{
                $this->initConnection->select_db($this->DatabaseName);
            }
        }

        // The Destructor for the Singleton_Database_Connection class
        public function __destruct() // destructor closes connection
        {
            // Check if the connection is still open and close it
            if (mysqli_ping($this->initConnection))
            {
                $this->initConnection->close();
            }
        }

        // * BRANDS TABLE
        public function get_Image_and_Name($ID){
            // Check if the ID is not ot of the bounds of the database
            if ($ID >= 1 && $ID <= 32){
                $UserQueryExecution = $this->initConnection->prepare("SELECT image_name, image_url FROM brands WHERE id= ?");
                $UserQueryExecution->bind_param("s", $ID);
                $UserQueryExecution->execute();
                $result = $UserQueryExecution->get_result();
                if ($result->num_rows > 0){
                    return $result;
                }
            }
            return false;
        }
    }
?>