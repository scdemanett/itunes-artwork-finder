var pathToAPI = 'api.php'; // replace with your path to the api.php file

var countries = {
    ae: 'United Arab Emirates',
    ag: 'Antigua and Barbuda',
    ai: 'Anguilla',
    al: 'Albania',
    am: 'Armenia',
    ao: 'Angola',
    ar: 'Argentina',
    at: 'Austria',
    au: 'Australia',
    az: 'Azerbaijan',
    bb: 'Barbados',
    be: 'Belgium',
    bf: 'Burkina-Faso',
    bg: 'Bulgaria',
    bh: 'Bahrain',
    bj: 'Benin',
    bm: 'Bermuda',
    bn: 'Brunei Darussalam',
    bo: 'Bolivia',
    br: 'Brazil',
    bs: 'Bahamas',
    bt: 'Bhutan',
    bw: 'Botswana',
    by: 'Belarus',
    bz: 'Belize',
    ca: 'Canada',
    cg: 'Democratic Republic of the Congo',
    ch: 'Switzerland',
    cl: 'Chile',
    cn: 'China',
    co: 'Colombia',
    cr: 'Costa Rica',
    cv: 'Cape Verde',
    cy: 'Cyprus',
    cz: 'Czech Republic',
    de: 'Germany',
    dk: 'Denmark',
    dm: 'Dominica',
    do: 'Dominican Republic',
    dz: 'Algeria',
    ec: 'Ecuador',
    ee: 'Estonia',
    eg: 'Egypt',
    es: 'Spain',
    fi: 'Finland',
    fj: 'Fiji',
    fm: 'Federated States of Micronesia',
    fr: 'France',
    gb: 'United Kingdom',
    gd: 'Grenada',
    gh: 'Ghana',
    gm: 'Gambia',
    gr: 'Greece',
    gt: 'Guatemala',
    gw: 'Guinea Bissau',
    gy: 'Guyana',
    hk: 'Hong Kong',
    hn: 'Honduras',
    hr: 'Croatia',
    hu: 'Hungary',
    id: 'Indonesia',
    ie: 'Ireland',
    il: 'Israel',
    in: 'India',
    is: 'Iceland',
    it: 'Italy',
    jm: 'Jamaica',
    jo: 'Jordan',
    jp: 'Japan',
    ke: 'Kenya',
    kg: 'Krygyzstan',
    kh: 'Cambodia',
    kn: 'Saint Kitts and Nevis',
    kr: 'South Korea',
    kw: 'Kuwait',
    ky: 'Cayman Islands',
    kz: 'Kazakhstan',
    la: 'Laos',
    lb: 'Lebanon',
    lc: 'Saint Lucia',
    lk: 'Sri Lanka',
    lr: 'Liberia',
    lt: 'Lithuania',
    lu: 'Luxembourg',
    lv: 'Latvia',
    md: 'Moldova',
    mg: 'Madagascar',
    mk: 'Macedonia',
    ml: 'Mali',
    mn: 'Mongolia',
    mo: 'Macau',
    mr: 'Mauritania',
    ms: 'Montserrat',
    mt: 'Malta',
    mu: 'Mauritius',
    mw: 'Malawi',
    mx: 'Mexico',
    my: 'Malaysia',
    mz: 'Mozambique',
    na: 'Namibia',
    ne: 'Niger',
    ng: 'Nigeria',
    ni: 'Nicaragua',
    nl: 'Netherlands',
    np: 'Nepal',
    no: 'Norway',
    nz: 'New Zealand',
    om: 'Oman',
    pa: 'Panama',
    pe: 'Peru',
    pg: 'Papua New Guinea',
    ph: 'Philippines',
    pk: 'Pakistan',
    pl: 'Poland',
    pt: 'Portugal',
    pw: 'Palau',
    py: 'Paraguay',
    qa: 'Qatar',
    ro: 'Romania',
    ru: 'Russia',
    sa: 'Saudi Arabia',
    sb: 'Soloman Islands',
    sc: 'Seychelles',
    se: 'Sweden',
    sg: 'Singapore',
    si: 'Slovenia',
    sk: 'Slovakia',
    sl: 'Sierra Leone',
    sn: 'Senegal',
    sr: 'Suriname',
    st: 'Sao Tome e Principe',
    sv: 'El Salvador',
    sz: 'Swaziland',
    tc: 'Turks and Caicos Islands',
    td: 'Chad',
    th: 'Thailand',
    tj: 'Tajikistan',
    tm: 'Turkmenistan',
    tn: 'Tunisia',
    tr: 'Turkey',
    tt: 'Republic of Trinidad and Tobago',
    tw: 'Taiwan',
    tz: 'Tanzania',
    ua: 'Ukraine',
    ug: 'Uganda',
    us: 'United States of America',
    uy: 'Uruguay',
    uz: 'Uzbekistan',
    vc: 'Saint Vincent and the Grenadines',
    ve: 'Venezuela',
    vg: 'British Virgin Islands',
    vn: 'Vietnam',
    ye: 'Yemen',
    za: 'South Africa',
    zw: 'Zimbabwe'
}

function updateUrlWithParams(entity, query, country) {
    var newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?entity=${encodeURIComponent(entity)}&query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`;
    window.history.pushState({path:newUrl}, '', newUrl);
}

function formatImageName(title, entity, extension) {
    if (entity === 'album') {
        const artistMatch = title.match(/\(by (.+)\)$/);
        if (artistMatch) {
            const artistName = artistMatch[1];
            const titleWithoutArtist = title.replace(/\s*\(by .+\)$/, '');
            return `${artistName} - ${titleWithoutArtist} - Front (Hi-Res)${extension}`;
        }
    }
    return title + extension;
}

function downloadImage(imageUrl, imageName, entity) {
    fetch(imageUrl, {
        mode: 'cors',
        credentials: 'same-origin'
    })
    .then(response => {
        const contentType = response.headers.get('Content-Type');
        let extension = '';
        switch (contentType) {
            case 'image/jpeg':
            case 'image/jpg':
                extension = '.jpg';
                break;
            case 'image/png':
                extension = '.png';
                break;
            case 'image/gif':
                extension = '.gif';
                break;
            default:
                extension = '.jpg';
                break;
        }
        return response.blob().then(blob => ({ blob, extension }));
    })
    .then(({ blob, extension }) => {
        const formattedImageName = formatImageName(imageName, entity, extension);
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = formattedImageName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
        console.error('Download failed:', error);
        alert('Failed to download image. Please try again.');
    });
}

function getSearchParameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = decodeURIComponent(tmparr[1]);
    }
    return params;
}

function performSearch() {
    var $results = $('#results');
    $results.html('');
    $results.append('<h3>Searching...</h3>');

    var query = $('#query').val();
    if (!query.length) {
        return false;
    };

    var entity = ($('#entity').val()) ? $('#entity').val() : 'tvSeason';
    var country = ($('#country').val()) ? $('#country').val() : 'us';

    $.ajax({
        type: "GET",
        crossDomain: true,
        url: pathToAPI,
        data: {
            query: query,
            entity: entity,
            country: country,
            type: 'request'
        },
        dataType: 'json'
    }).done(function (data) {
        $.ajax({
            type: "GET",
            crossDomain: true,
            url: data.url,
            data: {},
            dataType: 'jsonp'
        }).done(function (data) {
            $.ajax({
                type: "POST",
                crossDomain: true,
                url: pathToAPI,
                data: {
                    json: JSON.stringify(data),
                    type: 'data',
                    entity: entity
                },
                dataType: 'json'
            }).done(function (data) {
                $results.html('');
                if (data.error) {
                    $results.addClass('d-flex justify-content-center flex-wrap');
                    $results.append(`<h3>${data.error}</h3>`);
                } else {
                    if (!data.length) {
                        $results.append('<h3>No results found.</h3>');
                    } else {
                        for (var i = 0; i < data.length; i++) {
                            var result = data[i];

                            // console.log(result.title);

                            var html = `<div class="item align-self-end px-2 pb-5"><h3>${result.title}</h3>`;
                            if (entity != 'software' && entity != 'iPadSoftware' && entity != 'macSoftware') {
                                var uncompressed = result.uncompressed ? `<a href="${result.uncompressed}" target="_blank">Uncompressed High Resolution</a>` : `<a href="${result.hires}" target="_blank">High Resolution</a>`;
                                html += `<p class="mb-2"><a href="${result.url}" target="_blank">Standard Resolution</a> | ${uncompressed}</p>`;
                            } else if (entity == 'software' || entity == 'iPadSoftware') {
                                html += `<p><a href="${result.appstore}&country=${country}" target="_blank">View screenshots / videos</a></p>`;
                            }
                            html += `<a href="${result.uncompressed ? result.uncompressed : result.hires}" target="_blank" title="iTunes Artwork for '${result.title}'" onclick="event.preventDefault(); downloadImage('${result.uncompressed ? result.uncompressed : result.hires}', '${result.title.replace(/'/g, "\\'")}', '${entity}')" class="d-block"><img src="${result.url}" alt="iTunes Artwork for '${result.title}'" class="img-fluid"></a>`;

                            html += '</div>';

                            $results.append(html);
                        };
                        //Calls function in bootstrap-slider-custom.js
                        imgSliderEnable();
                    }
                }
                $results.append('<p class="footer">If the item you are searching for is not available on iTunes, this tool will not find it. Please do not email me asking for specific items if they are not available on iTunes! I recommend both <a href="https://sourceforge.net/projects/album-art" target="_blank">Album Art Downloader</a> and <a href="https://images.google.com" target="_blank">Google Image Search</a> as good alternative places to find artwork.</p>');

            });
        });
    });
}

$(document).ready(function () {
    var sortable = [];
    for (var key in countries) {
        sortable.push([key, countries[key]]);
    }
    sortable.sort(function (a, b) {
        if (a[1] < b[1]) return 1;
        if (a[1] > b[1]) return -1;
        return 0;
    });

    for (var i = sortable.length - 1; i >= 0; i--) {
        var array = sortable[i];
        $('#country').append(`<option value="${array[0]}">${array[1]}</option>`);
    };

    var params = getSearchParameters();
    if (params.entity && params.query && params.country) {
        $('#entity').val(params.entity);
        $('#query').val(params.query);
        $('#country').val(params.country);

        performSearch();
    }

    $('#iTunesSearch').submit(function () {
        var entity = $('#entity').val() || 'tvSeason';
        var query = $('#query').val();
        var country = $('#country').val() || 'us';

        if (!query.length) {
            alert("Please enter a search query.");
            return false;
        }

        performSearch();

        updateUrlWithParams(entity, query, country);

        return false;
    });

    $('#reset').click(function(event) {
        event.preventDefault();
        $('#iTunesSearchForm').get(0).reset();
        window.location.href = window.location.origin + window.location.pathname;
    });
});