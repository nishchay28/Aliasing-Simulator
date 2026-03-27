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
      // ===== Nyquist frequency (display purpose) =====
        const nyquistFreq = samplingRate / 2;

        // ===== Aliasing condition =====
        const isAliasing = samplingRate < 2 * signalFreq;
        let status = "no-aliasing";

        if (samplingRate < 2 * signalFreq) {
            if (samplingRate === signalFreq) {
                status = "critical"; // edge case
            } else {
                status = "aliasing";
            }
        }

        // ===== Alias frequency =====
        let aliasFreq = signalFreq;
        
        if (isAliasing) {
            let f = signalFreq;

            while (f > samplingRate / 2) {
                f = Math.abs(f - samplingRate);
            }

            aliasFreq = f;
        }

      // Update display values
      signalFreqValue.textContent = signalFreq + ' Hz';
      samplingRateValue.textContent = samplingRate + ' Hz';
      insightSignalFreq.textContent = signalFreq;
      insightSamplingRate.textContent = samplingRate;
      insightNyquistRate.textContent = nyquistFreq.toFixed(1);


      // ===== Sampling Status UI =====
    if (samplingRate < 2 * signalFreq) {
        if (samplingRate === signalFreq) {
            // CRITICAL CASE
            statusAliasing.classList.remove('hidden');
            statusNoAliasing.classList.add('hidden');

            statusAliasing.innerHTML = `
            <span class="text-yellow-400 font-semibold">Critical Sampling</span>
            Signal collapses to DC (0 Hz)
            `;
        } else {
            // ALIASING
            statusAliasing.classList.remove('hidden');
            statusNoAliasing.classList.add('hidden');

            statusAliasing.innerHTML = `
            <span class="text-red-500 font-semibold">Aliasing Occurring</span>
            Sampling rate is below Nyquist rate
            `;
        }
    } else {
        // NO ALIASING
        statusAliasing.classList.add('hidden');
        statusNoAliasing.classList.remove('hidden');
    }
      drawSineWave(signalFreq, samplingRate, isAliasing, aliasFreq);
      document.getElementById("alias-frequency").textContent = aliasFreq.toFixed(1) + " Hz";

      const explanation = document.getElementById("explanation-text");

        if (samplingRate < 2 * signalFreq) {
            if (samplingRate === signalFreq) {
                explanation.textContent =
                    "Critical sampling: signal collapses to DC (0 Hz)";
            } else {
                explanation.textContent =
                    `Aliasing: ${signalFreq} Hz appears as ${aliasFreq.toFixed(1)} Hz`;
            }
        } else {
            explanation.textContent =
                "No aliasing: sampling rate is sufficient to preserve signal";
        }

        const explanation2 = document.getElementById("explanation-text");

        if (samplingRate < 2 * signalFreq) {
            if (samplingRate === signalFreq) {
                explanation.textContent =
                    "Critical Sampling → Signal collapses to 0 Hz";
            } else {
                explanation.textContent =
                    `Aliasing Occurring → ${signalFreq} Hz is observed as ${aliasFreq.toFixed(1)} Hz`;
            }
        } else {
            explanation.textContent =
                "No Aliasing → Signal reconstructed correctly";
        }
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

  function drawSineWave(signalFreq, samplingRate, isAliasing, aliasFreq) {
    resizeCanvas();

    // const signalFreq = parseFloat(signalFreqSlider.value);
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = isAliasing ? 0.15 : 1;
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
    ctx.globalAlpha = 1;

    // ===== DRAW SAMPLED POINTS =====
    const N = 128;
    const duration = N / samplingRate;

    const samplesArray = [];
    const samples = [];

    // ✅ consistent frequency
    const effectiveFreq = isAliasing ? aliasFreq : signalFreq;
    const freqRatio = effectiveFreq / samplingRate;

    for (let n = 0; n < N; n++) {

        const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)));

        const value =
            Math.sin(2 * Math.PI * freqRatio * n) * window;

        samplesArray.push(value);

        const t = n / samplingRate;
        const x = (t / duration) * width;
        const y = centerY - amplitude * value;

        samples.push({ x, y });

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
        

        // ===== RECONSTRUCTED SIGNAL (LINEAR INTERPOLATION) =====
        ctx.beginPath();
        ctx.lineWidth = 3;
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

        // ===== IDEAL ALIAS SIGNAL (REFERENCE) =====

        if (isAliasing) {
            const k = Math.floor(signalFreq / samplingRate);
            // const aliasFreq = Math.abs(signalFreq - k * samplingRate);
            const effectiveAlias = aliasFreq;

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ef4444"; // red

            for (let x = 0; x < width; x++) {
                const t = x / width;

                const y =
                centerY -
                amplitude * Math.sin(2 * Math.PI * aliasFreq * t);

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();
        }

        drawFrequencyDomain(samplesArray, samplingRate);
  }

  function computeDFT(signal) {
        const N = signal.length;
        const spectrum = [];

        for (let k = 0; k < N; k++) {
            let real = 0;
            let imag = 0;

            for (let n = 0; n < N; n++) {
                const angle = (2 * Math.PI * k * n) / N;
                real += signal[n] * Math.cos(angle);
                imag -= signal[n] * Math.sin(angle);
            }

            spectrum.push(Math.sqrt(real * real + imag * imag));
        }

        return spectrum;
    }

    const freqCanvas = document.getElementById("freqCanvas");
    const freqCtx = freqCanvas.getContext("2d");

    function drawFrequencyDomain(signal, samplingRate) {
    const width = freqCanvas.clientWidth;
    const height = freqCanvas.clientHeight;

    freqCanvas.width = width;
    freqCanvas.height = height;

    const spectrum = computeDFT(signal);
    const N = signal.length;

    freqCtx.clearRect(0, 0, width, height);

    // find peak
    let maxIndex = 0;
    for (let i = 0; i < N / 2; i++) {
        if (spectrum[i] > spectrum[maxIndex]) {
            maxIndex = i;
        }
    }

    const maxMag = Math.max(...spectrum);

    // draw bars
    for (let i = 0; i < N / 2; i++) {
        const freq = (i * samplingRate) / N;
        const padding = 20;
        const x = padding + (freq / (samplingRate / 2)) * (width - 2 * padding);

        const magnitude = spectrum[i];
        const barHeight = (magnitude / maxMag) * height * 0.8;

        freqCtx.fillStyle = i === maxIndex ? "#ef4444" : "#22d3ee";
        if (i === maxIndex) {
            const peakFreq = (i * samplingRate) / N;

            freqCtx.fillStyle = "#ef4444";
            freqCtx.fillText(
                peakFreq.toFixed(1) + " Hz",
                x,
                height - barHeight - 10
            );
        }
        freqCtx.fillRect(x, height - barHeight, 2, barHeight);
    }

    freqCtx.fillStyle = "#e8dcdc";
    freqCtx.font = "10px monospace";

    for (let f = 0; f <= samplingRate / 2; f += 5) {
        const padding = 20;
        const x = padding + (f / (samplingRate / 2)) * (width - 2 * padding);

        freqCtx.fillText(f + "Hz", x - 10, height - 5);
    }

    // ===== Nyquist line =====
    freqCtx.beginPath();
    freqCtx.setLineDash([5, 5]);
    freqCtx.strokeStyle = "#888";

    freqCtx.moveTo(width, 0);
    freqCtx.lineTo(width, height);

    freqCtx.stroke();
    freqCtx.setLineDash([]);

    freqCtx.fillStyle = "#888";
    freqCtx.font = "12px monospace";
    freqCtx.fillText("Nyquist", width - 60, 15);
}
  window.addEventListener("resize", drawSineWave);

   // Initialize
   signalFreqSlider.value = 40;
   samplingRateSlider.value = 30;

   
    updateUI();