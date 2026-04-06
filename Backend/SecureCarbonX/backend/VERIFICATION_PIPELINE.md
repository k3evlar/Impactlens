# SecureCarbonX Verification Pipeline (Athena Green Upgrade)

## Objective
Upgrade the current single-step verification into a fraud-resistant, trustable pipeline without rebuilding the project.

## Proposed Pipeline

1. **Input Validation Layer**
   - Validate file presence, MIME type, and size limits.
   - Validate optional metadata (`location`, `captureTimestamp`, `deviceId`).

2. **Cybersecurity Fraud Gate (Pre-AI)**
   - **Duplicate detection** using SHA-256 image hash.
   - **Similarity check** using perceptual fingerprint distance (basic reverse-image style detection).
   - **Session anti-spam** check (rapid uploads from same user/session/IP).
   - **Metadata validation** for timestamp plausibility (not far in future/too old).
   - Return early on hard fraud failures.

3. **AI Verification Layer**
   - Existing AI endpoint (`/verify-image`) remains source for image-object confidence.
   - Keep AI fraud flags and trust scoring as core model signal.

4. **Decision Fusion Layer**
   - Merge AI risk flags + cybersecurity fraud flags.
   - Adjust trust score with cybersecurity penalty.
   - Output **confidence tier**:
     - `HIGH_TRUST` (>= 85)
     - `MEDIUM_TRUST` (70–84)
     - `REJECTED` (< 70)

5. **Persistence Layer (Blockchain-ready)**
   - Persist immutable action record fields:
     - `imageHash`, `activity` (if available), `credits`, `timestamp`, `ipfsUri`, `decision`.
   - Initial implementation can be local JSON append; structure aligns with on-chain migration.

6. **Audit & Monitoring Layer**
   - Log suspicious attempts (`duplicate`, `similarity`, `spam`, invalid metadata).
   - Use logs for future fraud score/trust score per user.

## API Output Enhancements
Add fields to existing upload response:
- `fraudCheck`: `{ verified, reason, flags, fraudScore }`
- `confidenceTier`: `HIGH_TRUST | MEDIUM_TRUST | REJECTED`
- `finalDecision`: `ACCEPT | REJECT`

## Why This Works for Hackathon MVP
- Minimal code disruption
- Strong cybersecurity narrative
- Immediate measurable anti-fraud value
- Blockchain-ready data contracts
