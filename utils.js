var utils = {
        /* modified from http://blog.stevenlevithan.com/archives/date-time-format */
        dateFormat: function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?/g,
                pad = function (val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) val = "0" + val;
                    return val;
                };

            return function (date, mask) {
                var date = Date.parse(date) ? new Date(date) : utils.parseISO8601(date), // parse date for IE8 since it's so lame
                    d = date.getDate(),
                    m = date.getMonth(),
                    y = date.getFullYear(),
                    flags = {
                        d:    d,
                        dd:   pad(d),
                        m:    m + 1,
                        mm:   pad(m + 1),
                        yy:   String(y).slice(2),
                        yyyy: y
                    };

                return mask.replace(token, function ($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }(),
        dateParse: function () {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?/g;

            return function (str, mask, offset) {
                var date = new Date(0),
                    matches = [],
                    order = [],
                    pattern = "",
                    depad = function(v){
                        return parseInt(v, 10);
                    },
                    modifiers = {
                        m:  function(v){return v - 1;},
                        mm: function(v){return v - 1;},
                        yy: function(v){return 2000 + v;}
                    },
                    methods = {
                        d:    "Date",
                        dd:   "Date",
                        m:    "Month",
                        mm:   "Month",
                        yy:   "FullYear",
                        yyyy: "FullYear",
                        H:    "Hours",
                        HH:   "Hours",
                        MM:   "Minutes"
                    },
                    patterns = {
                        d:    "[1-3]?\\d",
                        dd:   "[0-3]\\d",
                        m:    "1?\\d",
                        mm:   "[01]\\d",
                        yy:   "\\d{2}",
                        yyyy: "[12]\\d{3}",
                        H:    "[12]?\\d",
                        HH:   "[0-2]\\d",
                        MM:   "[0-5]\\d"
                    };

                mask = mask.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                pattern = mask.replace(token, function ($0) {
                    if ($0 in methods && $0 in patterns) {
                        order.push({
                            "method": methods[$0], 
                            "modifier": modifiers[$0]
                        });
                        return "(" + patterns[$0] + ")";
                    } else {
                        $0.slice(1, $0.length - 1);
                    }
                });

                matches = str.match(RegExp(pattern));

                for (var i = 1, l = matches.length; i < l; i++) {
                    var match = depad(matches[i]),
                        order_item = order[i - 1],
                        method = order_item.method,
                        modifier = order_item.modifier;

                    if (modifier) {
                        match = modifier(match);
                    }

                    if (method) {
                        date["setUTC" + method](match);
                    }
                }

                if (offset) {
                    date.setTime(date.getTime() + (+offset * 60 * 1000));
                }

                return date;
            };
        }(),
        /* Nano Templates - https://github.com/trix/nano */
        nano: function(template, data) {
            return template.replace(
                /\{\{([\w\.]*)\}\}/g, 
                function(str, key) {
                    var keys = key.split("."), v = data[keys.shift()];
                    for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
                    return (typeof v !== "undefined" && v !== null) ? v : "";
                }
            );
        },
        parseISO8601: function(dateString) {
            var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*/,
                date = new Date(NaN), 
                month,
                parts = isoExp.exec(dateString);

            if(parts) {
                month = +parts[2];
                date.setFullYear(parts[1], month - 1, parts[3]);
                if(month != date.getMonth() + 1) {
                    date.setTime(NaN);
                }
            }
            return date;
        }
    };