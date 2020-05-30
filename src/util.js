const moment = require('moment');
const Highcharts = require('highcharts');
import Papa from "papaparse";

import { companyId } from './api'

// Highcharts.setOptions({
//     global: {
//         useUTC: false
//     }
// });

export const DOMAIN_LIST = [
  /* Default domains included */
  "aol.com", "att.net", "comcast.net", "facebook.com", "gmail.com", "gmx.com", "googlemail.com",
  "google.com", "hotmail.com", "hotmail.co.uk", "mac.com", "me.com", "mail.com", "msn.com",
  "live.com", "sbcglobal.net", "verizon.net", "yahoo.com", "yahoo.co.uk",

  /* Other global domains */
  "email.com", "fastmail.fm", "games.com" /* AOL */, "gmx.net", "hush.com", "hushmail.com", "icloud.com",
  "iname.com", "inbox.com", "lavabit.com", "love.com" /* AOL */, "outlook.com", "pobox.com", "protonmail.ch", "protonmail.com", "tutanota.de", "tutanota.com", "tutamail.com", "tuta.io",
 "keemail.me", "rocketmail.com" /* Yahoo */, "safe-mail.net", "wow.com" /* AOL */, "ygm.com" /* AOL */,
  "ymail.com" /* Yahoo */, "zoho.com", "yandex.com",

  /* United States ISP domains */
  "bellsouth.net", "charter.net", "cox.net", "earthlink.net", "juno.com",

  /* British ISP domains */
  "btinternet.com", "virginmedia.com", "blueyonder.co.uk", "freeserve.co.uk", "live.co.uk",
  "ntlworld.com", "o2.co.uk", "orange.net", "sky.com", "talktalk.co.uk", "tiscali.co.uk",
  "virgin.net", "wanadoo.co.uk", "bt.com",

  /* Domains used in Asia */
  "sina.com", "sina.cn", "qq.com", "naver.com", "hanmail.net", "daum.net", "nate.com", "yahoo.co.jp", "yahoo.co.kr", "yahoo.co.id", "yahoo.co.in", "yahoo.com.sg", "yahoo.com.ph", "163.com", "yeah.net", "126.com", "21cn.com", "aliyun.com", "foxmail.com",

  /* French ISP domains */
  "hotmail.fr", "live.fr", "laposte.net", "yahoo.fr", "wanadoo.fr", "orange.fr", "gmx.fr", "sfr.fr", "neuf.fr", "free.fr",

  /* German ISP domains */
  "gmx.de", "hotmail.de", "live.de", "online.de", "t-online.de" /* T-Mobile */, "web.de", "yahoo.de",

  /* Italian ISP domains */
  "libero.it", "virgilio.it", "hotmail.it", "aol.it", "tiscali.it", "alice.it", "live.it", "yahoo.it", "email.it", "tin.it", "poste.it", "teletu.it",

  /* Russian ISP domains */
  "mail.ru", "rambler.ru", "yandex.ru", "ya.ru", "list.ru",

  /* Belgian ISP domains */
  "hotmail.be", "live.be", "skynet.be", "voo.be", "tvcablenet.be", "telenet.be",

  /* Argentinian ISP domains */
  "hotmail.com.ar", "live.com.ar", "yahoo.com.ar", "fibertel.com.ar", "speedy.com.ar", "arnet.com.ar",

  /* Domains used in Mexico */
  "yahoo.com.mx", "live.com.mx", "hotmail.es", "hotmail.com.mx", "prodigy.net.mx",

  /* Domains used in Canada */
  "yahoo.ca", "hotmail.ca", "bell.net", "shaw.ca", "sympatico.ca", "rogers.com",

  /* Domains used in Brazil */
  "yahoo.com.br", "hotmail.com.br", "outlook.com.br", "uol.com.br", "bol.com.br", "terra.com.br", "ig.com.br", "itelefonica.com.br", "r7.com", "zipmail.com.br", "globo.com", "globomail.com", "oi.com.br"
]

// mark colors based upon level

export const levelColor = (level) => {
  let color = 'green darken-1'
  level = level ? level.toLowerCase() : 'low'
  switch (level) {
    case 'high':
      color = 'red darken-4'
      break
    case 'medium':
      color = 'red lighten-1'
      break
    case 'low':
      color = 'green darken-1'
      break
  }
  return color
}

export const getData = (n) => {
    var arr = [],
        i,
        x,
        a,
        b,
        c,
        spike;
    for (
        i = 0;
        i < n;
        i = i + 1
    ) {
        if (i % 100 === 0) {
            a = 20 * Math.random();
        }
        if (i % 200 === 0) {
            a = 10 * Math.random();
        }
        if (i % 1000 === 0) {
            b = 5 * Math.random();
        }
        if (i % 10000 === 0) {
            c = 2 * Math.random();
        }
        if (i % 50000 === 0) {
            spike = 10;
        } else {
            spike = 0;
        }
        arr.push([
            moment().subtract(i, 'days').unix() * 1000,
            parseInt(2 * Math.sin(i / 100) + a + b + c + spike + Math.random())
        ]);
    }
    return arr;
}

export const getActiveData = (data) => {
  return data.map(val => {
    return [
      val[0],
      parseInt(val[1] - Math.random() * 3)
    ]
  })
}

export const validEmail = (email) => {
  const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return pattern.test(email)
}

export const comboChart = (data1, data2) => {
  let activeTeachers = 0 
  let signupTeachers = 0 
  data1.map(item => {
    signupTeachers += item[1]
  })
  data2.map(item => {
    activeTeachers += item[1]
  })
  let nonActiveTeachers = signupTeachers - activeTeachers

  return {
    chart: {
        zoomType: 'xy'
    },
    title: {
        text: 'Teacher Creature Dashboard'
    },
    subtitle: {
        text: ''
    },
    xAxis: [{
        type: 'datetime'
    }],
    yAxis: [{ // Primary yAxis
        labels: {
            format: '{value}',
            style: {
                color: "green"
            }
        },
        title: {
            text: 'Signups',
            style: {
                color: "blue"
            }
        }
    }, { // Secondary yAxis
        title: {
            text: 'Active',
            style: {
                color: "red"
            }
        },
        labels: {
            format: '{value}',
            style: {
                color: "yello"
            }
        },
        opposite: true
    }],
    tooltip: {
        shared: true
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        x: -120,
        verticalAlign: 'top',
        y: 0,
        floating: true,
        backgroundColor:
            'rgba(255,255,255,0.25)'
    },
    series: [{
        name: 'Number of teacher signups',
        type: 'column',
        yAxis: 1,
        // data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
        data: data1,
        tooltip: {
            valueSuffix: ''
        }

    }, {
        name: 'Number of active teacher profiles',
        type: 'spline',
        // data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6],
        data:data2,
        tooltip: {
            valueSuffix: ''
        }
    }]
  }

  /*, {
        type: 'pie',
        name: 'Total',
        tooltip: {
          pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b>'
        },
        data: [{
            name: 'Non Active Teachers',
            y: nonActiveTeachers,
            color: 'blue' // Jane's color
        }, {
            name: 'Active Teachers',
            y: activeTeachers,
            color: 'red' // John's color
        }],
        center: [100, -10],
        size: 100,
        showInLegend: false,
        dataLabels: {
            enabled: false
        }
    }*/
}

export const pieChart = (title, data, total) => {
  return {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: '100%'
    },
    title: {
      text: title
    },
    subtitle: {
      text: `Total ${total}`
    },
    tooltip: {
        pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b>'
    },
    accessibility: {
      announceNewData: {
            enabled: true
      },
      point: {
          valueSuffix: '%'
      }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false,
                format: '{point.y:.1f} %',
                distance: '-20%',
            },
            showInLegend: true,
            center: ['50%', '50%']
        },
    },
    series:  [{
      name: '',
      colorByPoint: true,
      size: '90%',
      innerSize: '80%',
      data,
    }]
  }
}

// Risk Pie chart  template
const riskPieChart = (high, medium, low, title, high_label='High', medium_label='Medium', low_label="Low") => {
  return {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: '100%'
    },
    title: {
      text: title
    },
    subtitle: {
      text: `Total ${high+medium+low}`
    },
    tooltip: {
        pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b>'
    },
    accessibility: {
      announceNewData: {
            enabled: true
      },
      point: {
          valueSuffix: '%'
      }
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: false,
                format: '{point.y:.1f} %',
                distance: '-20%',
            },
            showInLegend: true,
            center: ['50%', '50%']
        },
    },
    series: [{
      name: '',
      colorByPoint: true,
      size: '90%',
      innerSize: '80%',
      data: [{
          name: high_label,
          y: parseFloat(high),
          sliced: true,
          selected: true,
          color: 'red',
          drilldown: "High"
      }, {
          name: medium_label,
          y: parseFloat(medium),
          color: 'orange',
          drilldown: "Medium"
      }, {
          name: low_label,
          y: parseFloat(low),
          color: 'green',
          drilldown: "Low"
      }]
    }]
  }
}

// Bar Chart template
export const barchart = (title, subtitle='', yLabel, data, interval=1) => {
  return {
    chart: {
        type: 'column'
    },
    title: {
        text: title
    },
    subtitle: {
        text: subtitle
    },
    accessibility: {
      announceNewData: {
          enabled: true
      }
    },
    xAxis: {
        type: 'category'
    },
    yAxis: {
      min: 0,
      title: {
        text: yLabel
      },
      tickInterval: interval,
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
    },

    plotOptions: {
      series: {
          borderWidth: 0,
          dataLabels: {
              enabled: true,
              format: '{point.y}'
          }
      }
    },
    series: [
      {
        name: "",
        colorByPoint: true,
        data
      }
    ]
  }
}

// column chart
export const columnChart = (title, subtitle, yLabel, series, categories, interval=1) => {
  return {
    chart: {
        type: 'column'
    },
    title: {
        text: title
    },
    subtitle: {
        text: subtitle
    },
    xAxis: {
        categories: categories,
        crosshair: true
    },
    yAxis: {
        min: 0,
        title: {
            text: yLabel
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: series
  }
}

export const riskLevelChart = (high, medium, low) => {
  return riskPieChart(high, medium, low, 'Risk Levels')
}

export const userRiskChart = (high, medium, low) => {
  return riskPieChart(high, medium, low, 'High Risk Users')
}

export const appRiskChart = (high, medium, low) => {
  return riskPieChart(high, medium, low, 'High Risk Apps')
}

export const CIAChart = (high, medium, low) => {
  return riskPieChart(high, medium, low, 'CIA', 'Confidetiality', 'Availability', 'Integrity')
}

// donut chart template
export const scoreDonutChart = (score) => {
  let label = 'High Risk';
  let color = 'red';
  switch (score) {
    case 4:
    case 5:
      label = 'High Risk';
      color = 'red';
      break;
    case 3:
      label = 'Medium Risk';
      color = 'orange';
      break;
    default:
      label = 'Low Risk';
      color = 'green';
      break;
  }
  return {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: '100%'
    },
    title: {
      text: 'Org Score'
    },
    exporting: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    tooltip: {
        pointFormat: '<b>{point.y}</b>'
    },
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: true,
                distance: '-100%',
                y: -5,
                format: label,
                style: {
                    fontWeight: 'bold',
                    color: color,
                    fontSize: '14px'
                },
                filter: {
                    property: 'name',
                    operator: '===',
                    value: 'Score'
                },
            },
            borderWidth: 3
        },
        series: {
          animation: false
        }
    },
    series: [{
        type: 'pie',
        name: '',
        size: '70%',
        innerSize: '80%',
        data: [
            { name: 'Score', y: score, color: color },
            { name: '', y: 5-score, color: "#E6E6E6" },
        ]
    }]
  }
}

export const appUsersChart = (apps) => {
  let topApps = apps.sort((a, b) => b.no_users - a.no_users )
  let title= 'Users for Applications'
  let subtitle = `${apps.length} Applications`
  let yLabel = '# of Users'

  let data = []
  topApps.map(app => {
    if (Number(app.no_users) > 0) {
      data.push({
        name: app.application_name,
        y: app.no_users,
        drilldown: null
      })
    }
  })

  return barchart(title, subtitle, yLabel, data)
}

export const highriskCategoryChart = (categories) => {
  let title= 'Highest Risk by Category'
  let subtitle = `${categories.length} Categories`
  let yLabel = '# of Questions' 

  let topCategories = categories.sort((a, b) => b.cnt - a.cnt )
  let data = []
  topCategories.map(category => {
    if (Number(category.cnt) > 0) {
      data.push({
        name: category.category,
        y: category.cnt,
        drilldown: null
      })
    }
  })

  return barchart(title, subtitle, yLabel, data, 10)
}

export const ciaCategoryChart = (data, categories) => {
  let title = 'CIA by Category'
  let subtitle = `${categories.length} Categories`
  let yLabel = '#'

  return columnChart(title, subtitle, yLabel, data, categories)
}

export const get_json = (val) => {
  let res = {}
  try {
    res = JSON.parse(val.answer)
  } catch(e) {}
  return res
}

export const parse_array = (val) => {
  let res = []
  try {
    res = JSON.parse(val.answer)
  } catch(e) {}
  return res
}

export const beautifyEmail = (email) => {
  if (validEmail(email)) {
    return `<a href="mailto:${email}">${email}</a>`
  } else {
    return `${email}`
  }
}

export const beautifyDuration = (duration) => {
  return moment(duration, 'x').format('HH:mm:ss')
}
export const beautifyDateTimeFromUnix = (timestamp) => {
  return moment(timestamp, 'x').format('DD MMM YYYY, HH:mm:ss')
}

export const beautifyDateTime = (date) => {
  return moment(date).format('DD MMM YYYY, HH:mm:ss')
}

export const beautifyDate = (date) => {
  return moment(date).format('DD MMM YYYY')
}

export const beautifyDateZ = (date) => {
  return moment(date, 'YYYYMMDDHHmmss').format('MMM DD YYYY HH:mm:ss')
}

export const removeQuotes = (val) => {
  return val.replace(/\"/g, "")
}

export const readNewLine = (val) => {
  return val.replace(/\\n/g, '<br \\>')
}

export const getTableName = (val) => {
  const _val = val.toLowerCase().replace(' ', '_');
  var letters = /^[0-9a-zA-Z_]+$/;
  let name = ''
  for (var i = 0; i < _val.length; i++) {
    if (_val.charAt(i).match(letters)) {
      name += _val.charAt(i)
    }
  }

  return name
}

export const hexEncode = (str) =>  {
  var hex, i;

  var result = "";
  for (i=0; i < str.length; i++) {
      hex = str.charCodeAt(i).toString(16);
      result += (":"+hex).slice(-4);
  }

  return result.slice(1, result.length-2)
}

export const downloadCSV = (jsonData) => {
  const parseData = Papa.unparse(jsonData)
  var blob = new Blob([parseData], { type: 'text/csv;charset=utf-8;' });

  var link = document.createElement("a");

  var url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", 'filename.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}