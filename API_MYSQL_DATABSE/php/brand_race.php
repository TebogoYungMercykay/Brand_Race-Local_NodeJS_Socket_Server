<!-- BRAND RACE -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- BRAND RACE -->
        <title>TESTING API AND DATABASE</title>
        <link rel="icon" href="#" type="image/icon type">
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="author" content="BRAND RACE">
        <meta name="description" content="BRAND RACE LOCAL NODEJS SERVER">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="keywords" content="BRAND RACE">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js" integrity="sha512-bLT0Qm9VnAYZDflyKcBaQ2gg0hSYNQrJ8RilYldYQ1FxQYoCLtUjuuRuZo+fjqhx/qtq/1itJ0C2ejDxltZVFg==" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css"  type="text/css" rel="stylesheet" integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous" />
        <link rel="stylesheet" type="text/css" href="../css/brand_race.css"  id="theme-style">
    </head>
	<body class="background-brands">
        <section id="logo" class="mt-5">
            <div class="name-logo-top">
                <h1 class="page-name-purpose" id="page-name-brands">TESTING: API AND DATABASE</h1>
                <hr class="horizontal-row">
            </div>
        </section>
        <div class="about">
            <div id="class-brands-listings" class="top_class-brands-listings">
                <div class="class-brands-listings_post" id="post_css">
                    <input type="text" placeholder="Enter Limit.." class="limit" name="limit" id="limit_number">
                    <button id="send_post_request" type="submit" title="Submit" class="limit">SEND POST REQUEST</button>
                </div>
                <div class="class-brands-listing2">
                    <button id="send_get_request" type="submit" title="Submit" class="limit">SEND GET REQUEST</button>
                </div>
                <div class="class-brands-listing2">
                    <button id="clear_data" type="submit" title="Submit" class="limit">CLEAR DATA</button>
                </div>
            </div>
        </div>
        <div class="about">
            <div id="brands-listing" class="class-brands-listings">
            </div>
        </div>
        <br>
        <script src="../js/brands.js" type="text/javascript"></script>
	</body>
</html>