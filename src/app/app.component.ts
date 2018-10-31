import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import * as d3 from 'd3/d3.min.js';
import * as Datamap from 'datamaps/dist/datamaps.world.js';
import * as countries from 'i18n-iso-countries';

declare var require: any
const english_countries = require('i18n-iso-countries/langs/en.json');

countries.registerLocale(english_countries);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CoinCrawlerWebsite';

  datamap: Datamap;

  country2count = {}
  twoletter2count = [];

  chartData;

  @ViewChild('myChart') myChart: ElementRef;

  initChart() {
    let canvas = <HTMLCanvasElement> this.myChart.nativeElement;
    var ctx = canvas.getContext('2d');
    let data = this.twoletter2count.map(obj => obj.value);
    let labels = this.twoletter2count.map(obj => obj.name);
    this.chartData = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nodes by country',
          data: data,
          /*backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],*/
          borderWidth: 1
        }]
      },
      options: {
        legend: {
            display: false
        },
        responsive: false,
        tooltips: {
          xPadding: 4,
          yPadding: 4,
          // Disable the on-canvas tooltip
          enabled: false,
  
          custom: function(tooltipModel) {
            // Tooltip Element
            var tooltipEl = document.getElementById('chartjs-tooltip');
  
            // Create element on first render
            if (!tooltipEl) {
              tooltipEl = document.createElement('div');
              tooltipEl.id = 'chartjs-tooltip';
              tooltipEl.innerHTML = "<table></table>";
              document.body.appendChild(tooltipEl);
            }
  
            // Hide if no tooltip
            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = "0";
              return;
            }
  
            // Set caret Position
            tooltipEl.classList.remove('above', 'below', 'no-transform');
            if (tooltipModel.yAlign) {
              tooltipEl.classList.add(tooltipModel.yAlign);
            } else {
              tooltipEl.classList.add('no-transform');
            }
  
            function getBody(bodyItem) {
              return bodyItem.lines;
            }
  
            // Set Text
            if (tooltipModel.body) {
              var titleLines = tooltipModel.title || [];
              var bodyLines = tooltipModel.body.map(getBody);
  
              var innerHtml = '<thead>';
  
              titleLines.forEach(function(title) {
                  innerHtml += '<tr><th>' + title + '</th></tr>';
              });
              innerHtml += '</thead><tbody>';
  
              bodyLines.forEach(function(body, i) {
                  var colors = tooltipModel.labelColors[i];
                  var style = 'background:' + colors.backgroundColor;
                  style += '; border-color:' + colors.borderColor;
                  style += '; border-width: 2px';
                  var span = '<span style="' + style + '"></span>';
                  let components = body[0].split(":");
                  let country = components[0].trim();
                  let value = components[1].trim();
                  let countryFlag = '<span class="flag-icon flag-icon-'+countries.getAlpha2Code(country, 'en').toLowerCase()+'"></span>';
                  innerHtml += '<tr><td>' + span + countryFlag + ' <b>' + country + '</b>' + '<br/> Nodes: <b>' + value + '</b></td></tr>';
              });
              innerHtml += '</tbody>';
  
              var tableRoot = tooltipEl.querySelector('table');
              tableRoot.innerHTML = innerHtml;
            }
  
            // `this` will be the overall tooltip
            var position = this._chart.canvas.getBoundingClientRect();
  
            // Display, position, and set styles for font
            tooltipEl.style.opacity = "1";
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
            tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
            tooltipEl.style.fontFamily = tooltipModel._bodyFontFamily;
            tooltipEl.style.fontSize = tooltipModel.bodyFontSize + 'px';
            tooltipEl.style.fontStyle = tooltipModel._bodyFontStyle;
            tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
            tooltipEl.style.pointerEvents = 'none';
          }
        }
      }
    });
  }


  ngAfterViewInit() {
    this.initChart();
  }

  ngOnInit() {
    //this.initChart();
    this.countrycodes.forEach(countryCode => {
      let numberOfNodes = Math.floor(Math.pow(1+Math.random(), 10)-1);
      let twoletter = countries.alpha3ToAlpha2(countryCode);
      this.country2count[countryCode] = {
        numberOfNodes: numberOfNodes,
        twoletter: twoletter ? twoletter.toLowerCase() : undefined
      }
      if (twoletter !== undefined) 
        this.twoletter2count.push({
          key: twoletter.toLowerCase(),
          name: countries.getName(countryCode, "en"), 
          value: numberOfNodes
        });
    });

    let onlyValues = Object.keys(this.country2count).map(iso => this.country2count[iso].numberOfNodes);
    var minValue = Math.min.apply(null, onlyValues),
    maxValue = Math.max.apply(null, onlyValues);

    let paletteScale = d3.scale.linear()
            .domain([minValue, maxValue])
            .range(["#EFEFFF","#02386F"]);

    Object.keys(this.country2count).forEach(iso => {
        this.country2count[iso].fillColor = paletteScale(this.country2count[iso].numberOfNodes);
    });

    let container = document.getElementById('mapContainer');
    if (container === null || container === undefined) return;
    this.datamap = new Datamap({
        element: container,
        projection: 'mercator', // big world map
        responsive: false,
        // countries don't listed in dataset will be painted with this color
        fills: { defaultFill: '#F5F5F5' },
        data: this.country2count,
        geographyConfig: {
            borderColor: '#DEDEDE',
            highlightBorderWidth: 2,
            // don't change color on mouse hover
            highlightFillColor: function(geo) {
                return geo['fillColor'] || '#F5F5F5';
            },
            // only change border
            highlightBorderColor: '#B7B7B7',
            // show desired information in tooltip
            popupTemplate: function(geo, data) {
                // don't show tooltip if country don't present in dataset
                if (!data) { return ; }
                // tooltip content
                let result = ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Nodes: <strong>', data.numberOfNodes, '</strong>',
                    '</div>'];
                if (data.twoletter) {
                  result.splice(1, 0, '<span class="flag-icon flag-icon-', data.twoletter, '"></span> ');
                }
                return result.join('');
            }
        }
    });
  }

  countrycodes = ["ABW",
  "AFG",
  "AGO",
  "AIA",
  "ALA",
  "ALB",
  "AND",
  "ANT",
  "ARE",
  "ARG",
  "ARM",
  "ASM",
  "ATA",
  "ATF",
  "ATG",
  "AUS",
  "AUT",
  "AZE",
  "BDI",
  "BEL",
  "BEN",
  "BFA",
  "BGD",
  "BGR",
  "BHR",
  "BHS",
  "BIH",
  "BLM",
  "BLR",
  "BLZ",
  "BMU",
  "BOL",
  "BRA",
  "BRB",
  "BRN",
  "BTN",
  "BVT",
  "BWA",
  "CAF",
  "CAN",
  "CCK",
  "CHE",
  "CHL",
  "CHN",
  "CIV",
  "CMR",
  "COD",
  "COG",
  "COK",
  "COL",
  "COM",
  "CPV",
  "CRI",
  "CUB",
  "CXR",
  "CYM",
  "CYP",
  "CZE",
  "DEU",
  "DJI",
  "DMA",
  "DNK",
  "DOM",
  "DZA",
  "ECU",
  "EGY",
  "ERI",
  "ESH",
  "ESP",
  "EST",
  "ETH",
  "FIN",
  "FJI",
  "FLK",
  "FRA",
  "FRO",
  "FSM",
  "GAB",
  "GBR",
  "GEO",
  "GGY",
  "GHA",
  "GIB",
  "GIN",
  "GLP",
  "GMB",
  "GNB",
  "GNQ",
  "GRC",
  "GRD",
  "GRL",
  "GTM",
  "GUF",
  "GUM",
  "GUY",
  "HKG",
  "HMD",
  "HND",
  "HRV",
  "HTI",
  "HUN",
  "IDN",
  "IMN",
  "IND",
  "IOT",
  "IRL",
  "IRN",
  "IRQ",
  "ISL",
  "ISR",
  "ITA",
  "JAM",
  "JEY",
  "JOR",
  "JPN",
  "KAZ",
  "KEN",
  "KGZ",
  "KHM",
  "KIR",
  "KNA",
  "KOR",
  "KWT",
  "LAO",
  "LBN",
  "LBR",
  "LBY",
  "LCA",
  "LIE",
  "LKA",
  "LSO",
  "LTU",
  "LUX",
  "LVA",
  "MAC",
  "MAF",
  "MAR",
  "MCO",
  "MDA",
  "MDG",
  "MDV",
  "MEX",
  "MHL",
  "MKD",
  "MLI",
  "MLT",
  "MMR",
  "MNE",
  "MNG",
  "MNP",
  "MOZ",
  "MRT",
  "MSR",
  "MTQ",
  "MUS",
  "MWI",
  "MYS",
  "MYT",
  "NAM",
  "NCL",
  "NER",
  "NFK",
  "NGA",
  "NIC",
  "NIU",
  "NLD",
  "NOR",
  "NPL",
  "NRU",
  "NZL",
  "OMN",
  "PAK",
  "PAN",
  "PCN",
  "PER",
  "PHL",
  "PLW",
  "PNG",
  "POL",
  "PRI",
  "PRK",
  "PRT",
  "PRY",
  "PSE",
  "PYF",
  "QAT",
  "REU",
  "ROU",
  "RUS",
  "RWA",
  "SAU",
  "SDN",
  "SEN",
  "SGP",
  "SGS",
  "SHN",
  "SJM",
  "SLB",
  "SLE",
  "SLV",
  "SMR",
  "SOM",
  "SPM",
  "SRB",
  "STP",
  "SUR",
  "SVK",
  "SVN",
  "SWE",
  "SWZ",
  "SYC",
  "SYR",
  "TCA",
  "TCD",
  "TGO",
  "THA",
  "TJK",
  "TKL",
  "TKM",
  "TLS",
  "TON",
  "TTO",
  "TUN",
  "TUR",
  "TUV",
  "TWN",
  "TZA",
  "UGA",
  "UKR",
  "UMI",
  "URY",
  "USA",
  "UZB",
  "VAT",
  "VCT",
  "VEN",
  "VGB",
  "VIR",
  "VNM",
  "VUT",
  "WLF",
  "WSM",
  "YEM",
  "ZAF",
  "ZMB",
  "ZWE"];
}
