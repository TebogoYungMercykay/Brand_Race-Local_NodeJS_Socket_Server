<?php
 
// DISCLAIMER: This code does no error checking.

// This code should be run in the CLI using the php executable.
// However, this still can be run in the browser.
// Please note that the page would never load if run in the browser, unless
// an error occurs, it will just load indefinitely, as it is in a loop.


// This is the WEBSOCKET RFC: https://www.rfc-editor.org/rfc/rfc6455
// This details all the information of establishing a handshake.
// Also how data frames are built and how the server should process the frame to get the data


// Based on the RFC this masks the text to send.
// i.e. it builds a frame with header and then also the text converted into binary
function mask($text) {
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($text);

    if ($length <= 125)
        $header = pack('CC', $b1, $length);
    elseif ($length > 125 && $length < 65536)
        $header = pack('CCn', $b1, 126, $length);
    elseif ($length >= 65536)
        $header = pack('CCNN', $b1, 127, $length);
    return $header . $text;
}

// Based on the RFC this takes the received data and removes the header and
// gets the text sent.
// i.e. it removes the frame header and gets the text as a string
function unmask($text) {
    $length = ord($text[1]) & 127;
    if ($length == 126) {
        $masks = substr($text, 4, 4);
        $data = substr($text, 8);
    } elseif ($length == 127) {
        $masks = substr($text, 10, 4);
        $data = substr($text, 14);
    } else {
        $masks = substr($text, 2, 4);
        $data = substr($text, 6);
    }
    $text = "";
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    return $text;
}


// Allow the script to execute for an infinite time
set_time_limit(0);

// Turn on implicit output flushing to immediately print data as it comes in
ob_implicit_flush();

// Simple function to print socket errors, just to make life easier
function error($type, $socket = null)
{
	echo "Socket $type Failed: " . socket_strerror(socket_last_error($socket)) . "\n";
}

// Specify the address and port for the socket
$address = 'localhost';
$port = 8080;

// Create a new socket
// Parameter 1: Use IPv4, IPv6, or Unix protocols
// Parameter 2: Use streams, datagrams, or packets for the communication
// Parameter 3: Use TCP, UDP, or ICMP
if(($socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)) === false)
	error('Create');

// Bind the address and port to the socket
if(socket_bind($socket, $address, $port) === false)
	error('Bind', $socket);

// Start listening to incoming connections
// Parameter 1: The maximum number of connections to queue while busy serving a current one
if(socket_listen($socket, 5) === false)
	error('Listen', $socket);
echo "Socket server started on $address and port $port";
// Start an infinite loop to accept new incoming connections
do
{	
	// Although the server can handle 5 concurrent connections, 
	// this code can only serve one connection at a time.
	
	// Accept a request and establish the connection
    if(($message = socket_accept($socket)) === false)
	{
		error('Accept', $socket);
        break;
    }
	echo("\nNew socket connection: " . $message."\n");
	
	// Set the Websocket headers (IMPORTANT)
	// The browser will sent through an upgrade request to perform the handshake
	// The headers you will see are Sec-WebSocket-Key, Protocol, Extensions
	// The Protocol and Extensions are what is supported by the browser.
	// The Protocol dictates what data parsing the negotiation will use.
	// Since that is usually for IoT based sockets you can ignore those headers.
	
	
	// Next, we read the data sent by the browser.
	$request = socket_read($message, 5000);
	echo ($request); // Here you can see the headers
	// Next we need to extract the key, and then perform some signature to accept
    // the socket connection. Here we just using regex to capture the key from the 
    // text, you could also use good old string manipulations.
	
	preg_match('#Sec-WebSocket-Key: (.*)\r\n#', $request, $matches);
		
	// The RFC dictates how this signature should be created.
	// https://www.rfc-editor.org/rfc/rfc6455#section-11.3.1
	// Basically, you take the key sent in the header.
	// Add it to this string as defined by the RFC
	// Then convert it into binary, and base64 it.
	
	$key = base64_encode(pack(
		'H*',
		sha1($matches[1] . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
	));
	
	// Next we need to send back the headers to switch from http to websocket
	$headers = "HTTP/1.1 101 Switching Protocols\r\n";
	$headers .= "Upgrade: websocket\r\n";
	$headers .= "Connection: Upgrade\r\n";
	$headers .= "Sec-WebSocket-Version: 13\r\n";
	$headers .= "Sec-WebSocket-Accept: $key\r\n";
	$headers  .= "\r\n";
	
	echo("\n\n".$headers."\n\n");
	socket_write($message, $headers, strlen($headers));
	
	// Write/send some data over the socket
	// remember we know have to use the mask function to put the text in a frame.
    $data = mask('{"name" : "CryptoAPI", "version" : "1.0.0", "message" : "Provide a command"}');
    socket_write($message, $data, strlen($data));

	// Start an infinite loop to read and write data
    do
	{
		// Receive/read 2048 bytes at a time from the buffer
        if (($buf = socket_read($message, 2048, PHP_BINARY_READ )) === false)
		{
			error('Read', $message);
            break 2;
        }
		
		// Prints out the data the socket received removing the frame
		echo "Socket received: ".unmask($buf);
 
		// convert JSON string to an object
		$buffer = json_decode(unmask($buf));
		
		// Received a custom command to quit
        if($buffer->command == "quit") break;
		
		// Do something with the command and once done, send a reply
		// Here we just do an echo on the data sent
        $reply = mask(json_encode($buffer));
        socket_write($message, $reply, strlen($reply));
		 
    }
	while(true);
	
	// Close the current message socket
    socket_close($message);
}
while(true);

// Close the main listening connection
socket_close($socket);

?>