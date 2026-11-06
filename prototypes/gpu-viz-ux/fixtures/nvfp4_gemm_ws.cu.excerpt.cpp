// Fixture excerpt — illustrative warp-specialized GEMM skeleton (not production VRX code).
// Annotations below are programmer intent; they are not compiler-verified.

// @gpu.role producer warp=1
// @gpu.role mma     warp=2
// @gpu.role epilogue warpgroup=1,2  warps=4..11
// @gpu.tile BM=128 BN=256 BK=256 STAGES=4 ACCS=2

__global__ void __launch_bounds__(384, 1)
nvfp4_gemm_ws(/* tensor maps omitted */) {
  // Producer issues TMA into a 4-stage SMEM ring.
  // MMA issuer consumes stages and fills dual TMEM accumulators.
  // Epilogue warpgroups drain accumulators to BF16 stores.
}
