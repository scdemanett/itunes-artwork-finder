<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>iTunes Artwork Finder</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="css/bootstrap-slider.min.css">
    <link rel="stylesheet" href="css/style.min.css">
  </head>
  <body>
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="search container-fluid text-center">
            <h1>iTunes Artwork Finder</h1>
            <a id="search-toggle" class="collapsed hidden-sm hidden-md hidden-lg" data-toggle="collapse" href="#iTunesSearch"><span class="glyphicon"></span>Toggle Search</a>
            <form action="" method="get" accept-charset="utf-8" id="iTunesSearch" class="form-inline navbar-collapse collapse">
                <div class="form-group">
                    <select name="entity" id="entity" class="form-control">
                        <option value="album">Artist And Or Album</option>
                        <option value="idAlbum">Apple ID (Album)</option>
                        <option value="software">App</option>
                        <option value="id">Apple ID (Movie)</option>
                        <option value="audiobook">Audiobook</option>
                        <option value="ebook">iBook</option>
                        <option value="musicVideo">Music Video (May Not Work)</option>
                        <option value="movie">Movie</option>
                        <option value="podcast">Podcast</option>
                        <option value="shortFilm">Short Film</option>
                        <option value="tvSeason">TV Show</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="text" class="form-control" name="query" id="query" />
                </div>
                <div class="form-group">
                    <select name="country" id="country" class="form-control">
                        <option value='us'>United States of America</option>
                        <option value='gb'>United Kingdom</option>
                        <option value=''>---</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="submit" id="submit" class="btn btn-default hidden-xs" value="Get Artwork" />
                </div>
            </form>
            <div id="img-size-slider-container">
                <span class="glyphicon glyphicon-th" aria-hidden="true"></span>
                <input id="img-size" type="text" data-slider-id="img-size-slider" data-slider-enabled="false" data-slider-min="250" data-slider-max="600" data-slider-step="10" data-slider-value="600" data-slider-tooltip="show" data-slider-tooltip-position="bottom">
                <span class="glyphicon glyphicon-th-large" aria-hidden="true"></span>
            </div>
        </div>
    </nav>
    <div id="results" class="container-fluid">

    </div>
    <script src="js/jquery-2.2.4.min.js"></script>
    <script src="js/itunes.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/bootstrap-slider.min.js"></script>
    <script src="js/bootstrap-slider-custom.min.js"></script>
  </body>
</html>
