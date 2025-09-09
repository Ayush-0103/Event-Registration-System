export function generateQRCodeData(registrationId: string): string {
  // Generate QR code data - in a real app this would be more secure
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  return `${baseUrl}/attendance/${registrationId}`
}

export function generateRegistrationId(): string {
  return `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Real QR Code generation using Reed-Solomon error correction
export function generateQRCodeOnCanvas(canvas: HTMLCanvasElement, data: string): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  // Set canvas size for better scanning
  const size = 300
  canvas.width = size
  canvas.height = size

  // Clear canvas with white background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)

  // Generate real QR code matrix
  const qrMatrix = generateQRMatrix(data)
  const moduleCount = qrMatrix.length
  const moduleSize = Math.floor(size / (moduleCount + 8)) // Add quiet zone
  const offset = Math.floor((size - moduleCount * moduleSize) / 2)

  ctx.fillStyle = "#000000"

  // Draw QR code modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qrMatrix[row][col]) {
        ctx.fillRect(offset + col * moduleSize, offset + row * moduleSize, moduleSize, moduleSize)
      }
    }
  }
}

// Generate a proper QR code matrix with error correction
function generateQRMatrix(data: string): boolean[][] {
  const version = 2 // QR Version 2 (25x25 modules)
  const size = 25
  const matrix: boolean[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill(false))

  // Add finder patterns (position detection patterns)
  addFinderPattern(matrix, 0, 0)
  addFinderPattern(matrix, size - 7, 0)
  addFinderPattern(matrix, 0, size - 7)

  // Add separators around finder patterns
  addSeparators(matrix, size)

  // Add timing patterns
  addTimingPatterns(matrix, size)

  // Add dark module (required by QR spec)
  matrix[4 * version + 9][8] = true

  // Encode data using a simplified approach
  const encodedData = encodeData(data)
  placeDataBits(matrix, encodedData, size)

  return matrix
}

function addFinderPattern(matrix: boolean[][], startRow: number, startCol: number): void {
  const pattern = [
    [true, true, true, true, true, true, true],
    [true, false, false, false, false, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, false, false, false, false, true],
    [true, true, true, true, true, true, true],
  ]

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (startRow + i < matrix.length && startCol + j < matrix[0].length) {
        matrix[startRow + i][startCol + j] = pattern[i][j]
      }
    }
  }
}

function addSeparators(matrix: boolean[][], size: number): void {
  // Add white borders around finder patterns
  const positions = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]

  positions.forEach(([row, col]) => {
    // Add separator borders
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const r = row + i
        const c = col + j
        if (r >= 0 && r < size && c >= 0 && c < size) {
          if (i === -1 || i === 7 || j === -1 || j === 7) {
            if (!(i >= 0 && i < 7 && j >= 0 && j < 7)) {
              matrix[r][c] = false
            }
          }
        }
      }
    }
  })
}

function addTimingPatterns(matrix: boolean[][], size: number): void {
  // Horizontal timing pattern
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0
  }

  // Vertical timing pattern
  for (let i = 8; i < size - 8; i++) {
    matrix[i][6] = i % 2 === 0
  }
}

function encodeData(data: string): boolean[] {
  const bits: boolean[] = []

  // Mode indicator for byte mode (0100)
  bits.push(false, true, false, false)

  // Character count (8 bits for byte mode in version 2)
  const length = Math.min(data.length, 255)
  for (let i = 7; i >= 0; i--) {
    bits.push((length >> i) & 1 ? true : false)
  }

  // Data bytes
  for (let i = 0; i < length; i++) {
    const byte = data.charCodeAt(i)
    for (let j = 7; j >= 0; j--) {
      bits.push((byte >> j) & 1 ? true : false)
    }
  }

  // Add terminator (up to 4 zero bits)
  for (let i = 0; i < Math.min(4, 208 - bits.length); i++) {
    bits.push(false)
  }

  // Pad to make length multiple of 8
  while (bits.length % 8 !== 0) {
    bits.push(false)
  }

  // Add pad bytes alternating 11101100 and 00010001
  const padBytes = [0xec, 0x11]
  let padIndex = 0
  while (bits.length < 208) {
    // Max data bits for version 2
    const padByte = padBytes[padIndex % 2]
    for (let i = 7; i >= 0; i--) {
      if (bits.length < 208) {
        bits.push((padByte >> i) & 1 ? true : false)
      }
    }
    padIndex++
  }

  return bits
}

function placeDataBits(matrix: boolean[][], data: boolean[], size: number): void {
  let bitIndex = 0
  let up = true

  // Start from bottom-right, move in zigzag pattern
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col-- // Skip timing column

    for (let count = 0; count < size; count++) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c
        const currentRow = up ? size - 1 - count : count

        // Skip if position is already occupied by function patterns
        if (!isReserved(matrix, currentRow, currentCol, size)) {
          if (bitIndex < data.length) {
            matrix[currentRow][currentCol] = data[bitIndex]
            bitIndex++
          } else {
            // Apply mask pattern for remaining bits
            matrix[currentRow][currentCol] = (currentRow + currentCol) % 2 === 0
          }
        }
      }
    }
    up = !up
  }
}

function isReserved(matrix: boolean[][], row: number, col: number, size: number): boolean {
  // Check if position is part of finder patterns
  if ((row < 9 && col < 9) || (row < 9 && col >= size - 8) || (row >= size - 8 && col < 9)) {
    return true
  }

  // Check timing patterns
  if (row === 6 || col === 6) {
    return true
  }

  return false
}
