    // DOM Elements
    const signalFreqSlider = document.getElementById('signal-frequency');
    const samplingRateSlider = document.getElementById('sampling-rate');
    const signalFreqValue = document.getElementById('signal-freq-value');
    const samplingRateValue = document.getElementById('sampling-rate-value');
    const insightSignalFreq = document.getElementById('insight-signal-freq');
    const insightSamplingRate = document.getElementById('insight-sampling-rate');
    const insightNyquistRate = document.getElementById('insight-nyquist-rate');
    const statusNoAliasing = document.getElementById('status-no-aliasing');
    const statusAliasing = document.getElementById('status-aliasing');
    const btnCorrect = document.getElementById('btn-correct');
    const btnAliasing = document.getElementById('btn-aliasing');
    const btnNyquist = document.getElementById('btn-nyquist');

    // Update UI function
    function updateUI() {
      const signalFreq = parseInt(signalFreqSlider.value);
      const samplingRate = parseInt(samplingRateSlider.value);
      const nyquistRate = signalFreq * 2;
      const isAliasing = samplingRate < nyquistRate;

      // Update display values
      signalFreqValue.textContent = signalFreq + ' Hz';
      samplingRateValue.textContent = samplingRate + ' Hz';
      insightSignalFreq.textContent = signalFreq;
      insightSamplingRate.textContent = samplingRate;
      insightNyquistRate.textContent = nyquistRate;

      // Update status indicator
      if (isAliasing) {
        statusNoAliasing.classList.add('hidden');
        statusAliasing.classList.remove('hidden');
        statusAliasing.classList.add('flex');
      } else {
        statusAliasing.classList.add('hidden');
        statusAliasing.classList.remove('flex');
        statusNoAliasing.classList.remove('hidden');
      }
      drawSineWave();
    }

    // Event listeners for sliders
    signalFreqSlider.addEventListener('input', updateUI);
    samplingRateSlider.addEventListener('input', updateUI);

    // Preset buttons
    btnCorrect.addEventListener('click', function() {
      signalFreqSlider.value = 10;
      samplingRateSlider.value = 50;
      updateUI();
    });

    btnAliasing.addEventListener('click', function() {
      signalFreqSlider.value = 40;
      samplingRateSlider.value = 30;
      updateUI();
    });

    btnNyquist.addEventListener('click', function() {
      signalFreqSlider.value = 25;
      samplingRateSlider.value = 50;
      updateUI();
    });


     // ===== CANVAS RENDERING =====
  const canvas = document.getElementById("timeCanvas");
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function drawSineWave() {
    resizeCanvas();

    const signalFreq = parseFloat(signalFreqSlider.value);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#22d3ee";

    const amplitude = height / 3;
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      const t = x / width;

      const y =
        centerY -
        amplitude * Math.sin(2 * Math.PI * signalFreq * t);

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();

    // ===== DRAW SAMPLED POINTS =====
        const samplingRate = parseFloat(samplingRateSlider.value);
        const duration = 1; // seconds

        const Ts = 1 / samplingRate;

        ctx.fillStyle = "#a78bfa"; // purple

        const samples = [];

        for (let t = 0; t <= duration; t += Ts) {
            const x = t * width;

            const y =
                centerY -
                amplitude * Math.sin(2 * Math.PI * signalFreq * t);

            samples.push({ x, y });

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        // ===== RECONSTRUCTED SIGNAL (LINEAR INTERPOLATION) =====
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#22c55e"; // green

        for (let i = 0; i < samples.length; i++) {
        const point = samples[i];

        if (i === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
        }

        ctx.stroke();
  }
  window.addEventListener("resize", drawSineWave);

   // Initialize
    updateUI();