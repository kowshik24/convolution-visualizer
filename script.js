document.addEventListener('DOMContentLoaded', function() {
    // Initialize matrices with default values
    let inputMatrix = [];
    let weightMatrix = [];
    let outputMatrix = [];
    let paddedInputMatrix = [];
    
    // Animation variables
    let animationInterval = null;
    let currentStep = 0;
    let animationSpeed = 500; // milliseconds
    
    // Get DOM elements
    const inputHeightEl = document.getElementById('input-height');
    const inputWidthEl = document.getElementById('input-width');
    const kernelHeightEl = document.getElementById('kernel-height');
    const kernelWidthEl = document.getElementById('kernel-width');
    const paddingEl = document.getElementById('padding');
    const dilationEl = document.getElementById('dilation');
    const strideEl = document.getElementById('stride');
    const updateBtn = document.getElementById('update-btn');
    const animateBtn = document.getElementById('animate-btn');
    const stopBtn = document.getElementById('stop-btn');
    const speedEl = document.getElementById('speed');
    
    const inputMatrixEl = document.getElementById('input-matrix');
    const weightMatrixEl = document.getElementById('weight-matrix');
    const outputMatrixEl = document.getElementById('output-matrix');
    
    const inputDimEl = document.getElementById('input-dim');
    const kernelDimEl = document.getElementById('kernel-dim');
    const outputDimEl = document.getElementById('output-dim');
    
    // Update visualization on button click
    updateBtn.addEventListener('click', updateVisualization);
    
    // Initialize with default values
    updateVisualization();
    
    // Animation controls
    animateBtn.addEventListener('click', startAnimation);
    stopBtn.addEventListener('click', stopAnimation);
    speedEl.addEventListener('input', updateAnimationSpeed);
    
    function updateAnimationSpeed() {
        // Convert slider value (1-10) to milliseconds (1000-100)
        animationSpeed = 1100 - (speedEl.value * 100);
        if (animationInterval) {
            stopAnimation();
            startAnimation();
        }
    }
    
    function startAnimation() {
        if (animationInterval) {
            stopAnimation();
        }
        
        currentStep = 0;
        resetHighlights();
        animationInterval = setInterval(animateStep, animationSpeed);
    }
    
    function stopAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        resetHighlights();
    }
    
    function animateStep() {
        const inputHeight = parseInt(inputHeightEl.value);
        const inputWidth = parseInt(inputWidthEl.value);
        const kernelHeight = parseInt(kernelHeightEl.value);
        const kernelWidth = parseInt(kernelWidthEl.value);
        const padding = parseInt(paddingEl.value);
        const dilation = parseInt(dilationEl.value);
        const stride = parseInt(strideEl.value);
        
        // Calculate output dimensions
        const effectiveKernelHeight = kernelHeight + (kernelHeight - 1) * (dilation - 1);
        const effectiveKernelWidth = kernelWidth + (kernelWidth - 1) * (dilation - 1);
        
        const outputHeight = Math.floor((inputHeight + 2 * padding - effectiveKernelHeight) / stride) + 1;
        const outputWidth = Math.floor((inputWidth + 2 * padding - effectiveKernelWidth) / stride) + 1;
        
        // Calculate the current position
        const totalSteps = outputHeight * outputWidth;
        
        if (currentStep >= totalSteps) {
            stopAnimation();
            return;
        }
        
        // Calculate row and column in output matrix
        const outputRow = Math.floor(currentStep / outputWidth);
        const outputCol = currentStep % outputWidth;
        
        // Highlight relevant cells for this step
        resetHighlights();
        
        // Highlight the current output cell
        const outputCellId = `output-${outputRow}-${outputCol}`;
        const outputCell = document.getElementById(outputCellId);
        if (outputCell) {
            outputCell.classList.add('output-highlight');
        }
        
        // Highlight the corresponding input region
        const inputStartRow = outputRow * stride - padding;
        const inputStartCol = outputCol * stride - padding;
        
        for (let kh = 0; kh < kernelHeight; kh++) {
            for (let kw = 0; kw < kernelWidth; kw++) {
                const inputRow = inputStartRow + kh * dilation;
                const inputCol = inputStartCol + kw * dilation;
                
                // Check if this is a valid input position (not padding)
                if (inputRow >= 0 && inputRow < inputHeight && inputCol >= 0 && inputCol < inputWidth) {
                    const inputCellId = `input-${inputRow}-${inputCol}`;
                    const inputCell = document.getElementById(inputCellId);
                    if (inputCell) {
                        inputCell.classList.add('input-highlight');
                    }
                }
                
                // Always highlight the weight cell
                const weightCellId = `weight-${kh}-${kw}`;
                const weightCell = document.getElementById(weightCellId);
                if (weightCell) {
                    weightCell.classList.add('weight-highlight');
                }
            }
        }
        
        currentStep++;
    }
    
    function resetHighlights() {
        // Remove all highlights
        document.querySelectorAll('.input-highlight, .weight-highlight, .output-highlight').forEach(el => {
            el.classList.remove('input-highlight', 'weight-highlight', 'output-highlight');
        });
    }
    
    function updateVisualization() {
        // Get parameters
        const inputHeight = parseInt(inputHeightEl.value);
        const inputWidth = parseInt(inputWidthEl.value);
        const kernelHeight = parseInt(kernelHeightEl.value);
        const kernelWidth = parseInt(kernelWidthEl.value);
        const padding = parseInt(paddingEl.value);
        const dilation = parseInt(dilationEl.value);
        const stride = parseInt(strideEl.value);
        
        // Update dimension labels
        inputDimEl.textContent = `${inputHeight} × ${inputWidth}`;
        kernelDimEl.textContent = `${kernelHeight} × ${kernelWidth}`;
        
        // Calculate output dimensions
        const effectiveKernelHeight = kernelHeight + (kernelHeight - 1) * (dilation - 1);
        const effectiveKernelWidth = kernelWidth + (kernelWidth - 1) * (dilation - 1);
        
        const outputHeight = Math.floor((inputHeight + 2 * padding - effectiveKernelHeight) / stride) + 1;
        const outputWidth = Math.floor((inputWidth + 2 * padding - effectiveKernelWidth) / stride) + 1;
        
        outputDimEl.textContent = `${outputHeight} × ${outputWidth}`;
        
        // Generate random matrices
        generateMatrices(inputHeight, inputWidth, kernelHeight, kernelWidth, padding, outputHeight, outputWidth);
        
        // Render the matrices
        renderMatrix(paddedInputMatrix, inputMatrixEl, 'input', padding, inputHeight, inputWidth);
        renderMatrix(weightMatrix, weightMatrixEl, 'weight');
        renderMatrix(outputMatrix, outputMatrixEl, 'output');
        
        // Add event listeners for interactivity
        addInteractivity();
    }
    
    function generateMatrices(inputHeight, inputWidth, kernelHeight, kernelWidth, padding, outputHeight, outputWidth) {
        // Generate input matrix with random values (0-9)
        inputMatrix = Array(inputHeight).fill().map(() => 
            Array(inputWidth).fill().map(() => Math.floor(Math.random() * 10))
        );
        
        // Generate weight matrix with random values (-2 to 2)
        weightMatrix = Array(kernelHeight).fill().map(() => 
            Array(kernelWidth).fill().map(() => Math.floor(Math.random() * 5) - 2)
        );
        
        // Create padded input matrix
        paddedInputMatrix = Array(inputHeight + 2 * padding).fill().map((_, i) => 
            Array(inputWidth + 2 * padding).fill().map((_, j) => {
                const r = i - padding;
                const c = j - padding;
                if (r >= 0 && r < inputHeight && c >= 0 && c < inputWidth) {
                    return inputMatrix[r][c];
                }
                return 0; // Padding value
            })
        );
        
        // Calculate output matrix
        calculateOutputMatrix(padding, outputHeight, outputWidth);
    }
    
    function calculateOutputMatrix(padding, outputHeight, outputWidth) {
        const kernelHeight = weightMatrix.length;
        const kernelWidth = weightMatrix[0].length;
        const dilation = parseInt(dilationEl.value);
        const stride = parseInt(strideEl.value);
        
        outputMatrix = Array(outputHeight).fill().map((_, oh) => 
            Array(outputWidth).fill().map((_, ow) => {
                let sum = 0;
                
                for (let kh = 0; kh < kernelHeight; kh++) {
                    for (let kw = 0; kw < kernelWidth; kw++) {
                        const ih = oh * stride + kh * dilation;
                        const iw = ow * stride + kw * dilation;
                        
                        sum += paddedInputMatrix[ih][iw] * weightMatrix[kh][kw];
                    }
                }
                
                return sum;
            })
        );
    }
    
    function renderMatrix(matrix, container, type, padding = 0, inputHeight = 0, inputWidth = 0) {
        container.innerHTML = '';
        
        // Set grid dimensions
        container.style.gridTemplateRows = `repeat(${matrix.length}, 40px)`;
        container.style.gridTemplateColumns = `repeat(${matrix[0].length}, 40px)`;
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[i].length; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `${type}-${i}-${j}`;
                
                // Check if this is a padding cell for the input matrix
                if (type === 'input' && (i < padding || i >= inputHeight + padding || j < padding || j >= inputWidth + padding)) {
                    cell.classList.add('padding-cell');
                } else {
                    cell.classList.add(`${type}-cell`);
                }
                
                cell.textContent = matrix[i][j];
                container.appendChild(cell);
            }
        }
    }
    
    function addInteractivity() {
        // Input cell hover - highlight corresponding output cells
        const inputCells = document.querySelectorAll('.input-cell');
        inputCells.forEach(cell => {
            cell.addEventListener('mouseenter', () => highlightInputRelationships(cell));
            cell.addEventListener('mouseleave', resetHighlights);
        });
        
        // Weight cell hover - highlight which inputs were used to compute outputs
        const weightCells = document.querySelectorAll('.weight-cell');
        weightCells.forEach(cell => {
            cell.addEventListener('mouseenter', () => highlightWeightRelationships(cell));
            cell.addEventListener('mouseleave', resetHighlights);
        });
        
        // Output cell hover - highlight corresponding input cells and weights
        const outputCells = document.querySelectorAll('.output-cell');
        outputCells.forEach(cell => {
            cell.addEventListener('mouseenter', () => highlightOutputRelationships(cell));
            cell.addEventListener('mouseleave', resetHighlights);
        });
    }
    
    function highlightInputRelationships(cell) {
        const [_, rowStr, colStr] = cell.id.split('-');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
        
        const padding = parseInt(paddingEl.value);
        const stride = parseInt(strideEl.value);
        const dilation = parseInt(dilationEl.value);
        
        const kernelHeight = weightMatrix.length;
        const kernelWidth = weightMatrix[0].length;
        
        const effectiveKernelHeight = kernelHeight + (kernelHeight - 1) * (dilation - 1);
        const effectiveKernelWidth = kernelWidth + (kernelWidth - 1) * (dilation - 1);
        
        // Check which output cells are affected by this input
        for (let oh = 0; oh < outputMatrix.length; oh++) {
            for (let ow = 0; ow < outputMatrix[0].length; ow++) {
                // Calculate input region for this output
                const inputStartRow = oh * stride;
                const inputStartCol = ow * stride;
                const inputEndRow = inputStartRow + effectiveKernelHeight - 1;
                const inputEndCol = inputStartCol + effectiveKernelWidth - 1;
                
                // Check if our input cell is within this region
                if (row >= inputStartRow && row <= inputEndRow && col >= inputStartCol && col <= inputEndCol) {
                    // Check if it's actually used by the kernel (considering dilation)
                    if ((row - inputStartRow) % dilation === 0 && (col - inputStartCol) % dilation === 0) {
                        // This input cell affects this output cell
                        const outputCell = document.getElementById(`output-${oh}-${ow}`);
                        if (outputCell) {
                            outputCell.classList.add('output-highlight');
                        }
                    }
                }
            }
        }
        
        // Highlight the input cell
        cell.classList.add('input-highlight');
    }
    
    function highlightWeightRelationships(cell) {
        const [_, rowStr, colStr] = cell.id.split('-');
        const kernelRow = parseInt(rowStr);
        const kernelCol = parseInt(colStr);
        
        const padding = parseInt(paddingEl.value);
        const stride = parseInt(strideEl.value);
        const dilation = parseInt(dilationEl.value);
        
        // Highlight the weight cell
        cell.classList.add('weight-highlight');
        
        // For each output position, highlight the input position that uses this weight
        for (let oh = 0; oh < outputMatrix.length; oh++) {
            for (let ow = 0; ow < outputMatrix[0].length; ow++) {
                const inputRow = oh * stride + kernelRow * dilation;
                const inputCol = ow * stride + kernelCol * dilation;
                
                // Highlight corresponding input cell
                const inputCell = document.getElementById(`input-${inputRow}-${inputCol}`);
                if (inputCell) {
                    inputCell.classList.add('input-highlight');
                }
                
                // Highlight corresponding output cell
                const outputCell = document.getElementById(`output-${oh}-${ow}`);
                if (outputCell) {
                    outputCell.classList.add('output-highlight');
                }
            }
        }
    }
    
    function highlightOutputRelationships(cell) {
        const [_, rowStr, colStr] = cell.id.split('-');
        const row = parseInt(rowStr);
        const col = parseInt(colStr);
        
        const padding = parseInt(paddingEl.value);
        const stride = parseInt(strideEl.value);
        const dilation = parseInt(dilationEl.value);
        const kernelHeight = weightMatrix.length;
        const kernelWidth = weightMatrix[0].length;
        
        // Highlight the output cell
        cell.classList.add('output-highlight');
        
        // Highlight corresponding input region and weights
        for (let kh = 0; kh < kernelHeight; kh++) {
            for (let kw = 0; kw < kernelWidth; kw++) {
                // Highlight weight
                const weightCell = document.getElementById(`weight-${kh}-${kw}`);
                if (weightCell) {
                    weightCell.classList.add('weight-highlight');
                }
                
                // Highlight input
                const inputRow = row * stride + kh * dilation;
                const inputCol = col * stride + kw * dilation;
                const inputCell = document.getElementById(`input-${inputRow}-${inputCol}`);
                if (inputCell) {
                    inputCell.classList.add('input-highlight');
                }
            }
        }
    }
});
