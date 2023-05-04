const BASE_URL = '192.168.1.38:5000';

$(document).ready(function () {
    let led_color = 'red';
    let id = 1;
    let intervalId;

    let table = $('#dataTable').DataTable({"order": [[0, "desc"]]});

    Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#858796';

    let chartTemperature = createChart("chartTemperature", " °C");
    let chartHumidity = createChart("chartHumidity", "%");

    function fetchData() {
        $.getJSON('http://' + BASE_URL + '/data/last', function (data) {
            console.log(data[0]);
            addRowToTable(data[0], id, table);
            id++;

            //graf
            addDataToChart(chartTemperature, new Date().toTimeString().split(' ')[0], data[0][1]);
            addDataToChart(chartHumidity, new Date().toTimeString().split(' ')[0], data[0][2]);
            $('#temperature-value').html(data[0][1] + ' °C');
            $('#humidity-value').html(data[0][2] + '%');
        });
    }

    $('#start-button').click(function () {
        if ($(this).text() === 'Stop') {
            $(this).text('Start');
            clearInterval(intervalId);
        } else {
            fetchData();  // fetch the data immediately
            intervalId = setInterval(fetchData, 5000);  // and then every 5 seconds
            $(this).text('Stop');
        }
    });

    $('#led').click(function () {
        if ($(this).text() === 'OFF') {
            $(this).text('ON');
            $('#led-icon').removeClass('text-gray-300').addClass('text-warning');
            changeLedStatus(1, led_color);
        } else {
            $(this).text('OFF');
            $('#led-icon').removeClass('text-warning').addClass('text-gray-300');
            changeLedStatus(0, led_color);
        }
    });

    $('.led-color').click(function () {
        let color = $(this).prop("value");
        $(this).children('i').removeClass('fa-circle').addClass('fa-circle-notch');
        $('.led-color[value="led-'+led_color+'"]').children('i').removeClass('fa-circle-notch').addClass('fa-circle');
        led_color = color.replace('led-', '');
        console.log("clicked");
        if ($('#led').text() === 'OFF') {
            changeLedStatus(0, color);
        }
        if ($('#led').text() === 'ON') {
            changeLedStatus(1, color);
        }

    });


});

function changeLedStatus(status, led_color) {
    $.ajax({
        type: "POST",
        url: "http://"+BASE_URL+"/led",
        data: JSON.stringify({sensor: 'led', led_enabled: status, led_color: led_color.replace('led-', '') }),
        success: function () {
            console.log("ok");
        },
        error: function () {
            console.log("fail");
        },
        contentType : 'application/json',
        dataType: 'html'
    });
}

function addRowToTable(data, id, table) {
    let row = [];
    row.push(id);
    row.push(data[1] + ' °C');
    row.push(data[2] + '%');
    row.push(new Date().toTimeString().split(' ')[0]);
    table.row.add(row).draw(false);
}

function addDataToChart(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function createChart(id, label) {
    return new Chart(id, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Teplota ",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: [],
            }],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return  number_format(value) + label;
                        }
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + number_format(tooltipItem.yLabel) + label;
                    }
                }
            }
        }
    });
}