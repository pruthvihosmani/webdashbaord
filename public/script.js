document.addEventListener('DOMContentLoaded', function() {
    const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);
  
    // Data storage for historical data
    let accelerometerData = {
      labels: [],
      datasets: [
        { label: 'X', data: [], borderColor: 'red', fill: false, borderWidth: 2 },
        { label: 'Y', data: [], borderColor: 'green', fill: false, borderWidth: 2 },
        { label: 'Z', data: [], borderColor: 'blue', fill: false, borderWidth: 2 }
      ]
    };
  
    let metallicPresenceData = {
      labels: [],
      datasets: [{ label: 'Metallic Presence', data: [], backgroundColor: 'purple' }]
    };
  
    let magnetometerData = {
      labels: [],
      datasets: [
        { label: 'Magnetometer', data: [], borderColor: 'orange', fill: false, borderWidth: 2 }
      ]
    };
  
    let uvSensorData = {
      labels: [],
      datasets: [
        { label: 'UV Distance', data: [], borderColor: 'violet', fill: false, borderWidth: 2 }
      ]
    };
  
    // Create charts
    const accelerometerChart = createLineChart('accelerometerChart', 'Accelerometer Data', accelerometerData);
    const metallicPresenceChart = createBarChart('metallicPresenceChart', 'Metallic Presence', metallicPresenceData);
    const magnetometerChart = createLineChart('magnetometerChart', 'Magnetometer Data', magnetometerData);
    const uvSensorChart = createLineChart('uvSensorChart', 'UV Sensor Data', uvSensorData);
  
    let lastTimestamp = null;
  
    // WebSocket event listener for incoming messages
    ws.onmessage = function(event) {
      const data = JSON.parse(event.data);
      console.log("Data received from server:", data); // Debugging log
      const timestamp = new Date();
      lastTimestamp = timestamp;
      updateCharts(data, timestamp);
    };
  
    setInterval(function() {
      const timestamp = new Date();
      if (lastTimestamp && (timestamp - lastTimestamp) >= 1000) {
        console.log("No data received for 1 second, adding placeholder"); // Debugging log
        addMissingDataPoint(timestamp);
      }
    }, 1000);
  
    function updateCharts(data, timestamp) {
      if (data.accelerometer) {
        const { ax, ay, az } = data.accelerometer;
        addDataToChart(accelerometerChart, timestamp, [ax, ay, az]);
      }
  
      if (data.metallicPresence !== undefined) {
        addDataToChart(metallicPresenceChart, timestamp, [data.metallicPresence]);
      }
  
      if (data.magnetometer) {
        const { mx, my, mz } = data.magnetometer;
        addDataToChart(magnetometerChart, timestamp, [mx, my, mz]);
      }
  
      if (data.ultrasonic) {
        const { distance } = data.ultrasonic;
        addDataToChart(uvSensorChart, timestamp, [distance]);
  
        const uvAlert = document.getElementById('uvAlert');
        if (distance > 2) {
          uvAlert.style.display = 'block';
          uvAlert.textContent = `Alert: Height exceeds 2 meters! Current height: ${distance.toFixed(2)} meters.`;
        } else {
          uvAlert.style.display = 'none';
        }
      }
    }
  
    function addMissingDataPoint(timestamp) {
      addDataToChart(accelerometerChart, timestamp, [null, null, null]);
      addDataToChart(metallicPresenceChart, timestamp, [null]);
      addDataToChart(magnetometerChart, timestamp, [null, null, null]);
      addDataToChart(uvSensorChart, timestamp, [null]);
    }
  
    function addDataToChart(chart, timestamp, dataArray) {
      chart.data.labels.push(timestamp);
      chart.data.datasets.forEach((dataset, index) => {
        if (dataArray[index] === null) {
          dataset.data.push({ x: timestamp, y: dataArray[index], borderColor: 'rgba(0, 0, 0, 0.1)' });
        } else {
          dataset.data.push({ x: timestamp, y: dataArray[index] });
        }
      });
      chart.update();
    }
  
    function createLineChart(id, title, data) {
      return new Chart(document.getElementById(id), {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'second',
                displayFormats: {
                  second: 'HH:mm:ss'
                }
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: title
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + (context.parsed.y !== null ? context.parsed.y.toFixed(2) : 'No Data');
                }
              }
            }
          }
        }
      });
    }
  
    function createBarChart(id, title, data) {
      return new Chart(document.getElementById(id), {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'second',
                displayFormats: {
                  second: 'HH:mm:ss'
                }
              },
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0
              }
            },
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: title
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + (context.parsed.y !== null ? context.parsed.y : 'No Data');
                }
              }
            }
          }
        }
      });
    }
  });
  