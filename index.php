<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>iTunes Artwork Finder</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/bootstrap-slider.min.css">
    <link rel="stylesheet" href="css/style.min.css">
</head>

<body class="bg-secondary">
    <nav class="navbar navbar-dark bg-dark navbar-expand-md justify-content-center fixed-top">
        <div class="row">
            <div class="search col text-center">
                <h1>iTunes Artwork Finder</h1>
                <a id="searchToggle" class="collapsed d-block d-md-none" data-toggle="collapse"
                    href="#iTunesSearch">Toggle Search</a>
                <div id="iTunesSearch" class="navbar-collapse collapse">
                    <form id="iTunesSearchForm" action="" method="get" accept-charset="utf-8" class="form-inline">
                        <div class="input-group">
                            <select name="entity" id="entity" class="form-control">
                                <option value="album">Artist And Or Album</option>
                                <option value="idAlbum">Apple ID (Album)</option>
                                <option value="software">App (iPhone or Universal)</option>
                                <option value="iPadSoftware">App (iPad)</option>
                                <option value="macSoftware">App (macOS)</option>
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
                        <div class="input-group my-2 my-lg-0 mx-lg-2">
                            <input type="text" class="form-control" name="query" id="query" />
                        </div>
                        <div class="input-group">
                            <select name="country" id="country" class="form-control">
                                <option value='us'>United States of America</option>
                                <option value='gb'>United Kingdom</option>
                                <option value='jp'>Japan</option>
                                <option value=''>---</option>
                            </select>
                        </div>
                        <div class="input-group mt-2 mt-lg-0 ml-lg-2 justify-content-center">
                            <button type="submit" id="submit" class="btn btn-secondary d-md-block">GetArtwork</button>
                            <button type="button" class="btn btn-secondary dropdown-toggle dropdown-toggle-split ml-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="sr-only">Toggle Dropdown</span>
                            </button>
                            <div class="dropdown-menu">
                                <a id="reset" class="dropdown-item" href="javascript:void(0);">Reset</a>
                            </div>
                        </div>
                    </form>
                </div>

                <div id="imgSizeSliderContainer" class="mt-3">
                    <svg class="mr-3" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-grid-3x3-gap-fill"
                        fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z" />
                    </svg>
                    <input id="imgSize" type="text" data-slider-id="imgSizeSlider" data-slider-enabled="false"
                        data-slider-min="250" data-slider-max="600" data-slider-step="10" data-slider-value="600"
                        data-slider-tooltip="show" data-slider-tooltip-position="bottom">
                    <svg class="ml-3" width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-grid-fill" fill="white"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
                    </svg>
                </div>
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