<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>iTunes Artwork Finder</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/bootstrap-theme.min.css">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="search container-fluid">
        <h1>iTunes Artwork Finder</h1>
        <form action="" method="get" accept-charset="utf-8" id="iTunesSearch" class="form-inline">
            <select name="entity" id="entity" class="form-control">
                <option value="album">Artist And Or Album</option>
                <option value="idAlbum">Apple ID (Album)</option>
                <option value="software">App</option>
                <option value="id">Apple ID (Movies)</option>
                <option value="audiobook">Audiobook</option>
                <option value="ebook">iBook</option>
                <option value="musicVideo">Music Video (May Not Work)</option>
                <option value="movie">Movie</option>
                <option value="podcast">Podcast</option>
                <option value="shortFilm">Short Film</option>
                <option value="tvSeason">TV Show</option>
            </select>
            <input type="text" class="form-control" name="query" id="query" />
            <select name="country" id="country" class="form-control">
                <option value='us'>United States of America</option>
                <option value='gb'>United Kingdom</option>
                <option value=''>---</option>
            </select>
            <input type="submit" id="submit" class="btn btn-default" value="Get Artwork" />
        </form>
      </div>
    </nav>
    <div id="results" class="container-fluid">

    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
    <script src="js/itunes.js"></script>
    <script src="js/bootstrap.min.js"></script>
  </body>
</html>
