----------------------- BASIC SETUP AND GUIDELINES -----------------------

Step 1: Install Xampp or any tool to interpret PHP code
    - Start the Apache, FileZilla and MySQL server
    - Click on the Admin button for the Apache Server
    - Click on the phpMyAdmin link and follow the next steps.
Step 2: Download, Extract and Copy the "API_MYSQL_DATABASE" into the path/to/Xampp/htdocs folder.
Step 3: Import the database dump on the phpMyAdmin localhost server
 - Database Dump Path: path/to/Xampp/htdocs/API_MYSQL_DATABSE/database_dump/file
Step 4: Open a browser and paste this URL to view the Basic Front End for the API (Just for Testing)
    - Preferably Microsoft Edge (to avoid unnecessary CORS (Cross-Origin Resource Sharing) errors).
    - http://localhost/API_MYSQL_DATABSE/php/brand_race.php
    - NB: Be sure not to use https since the connection is not secure.
Step 5: You can add the "API_MYSQL_DATABASE" folder to your Workspace on VS Code or any IDE/Tool/Software of your choice.
    - To browse through the code
    - And probably modify the codes to fit your requirements.