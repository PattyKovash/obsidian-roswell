#  

## Background


 Claudia flagged on the May 28 launch day call that 9×16 vertical walking videos on PDP (and potentially PLP) are cropping both the model's head and feet — the full outfit is not visible. The preference is to show the full head-to-toe look. Decision: crop from the top of the frame, not the middle, so feet remain in frame.

> [Claudia, May 28]: "You can't see the whole outfit — you need to see from the head down to the shoes."

# Objective / Acceptance Criteria

- [ ]  9×16 vertical videos show the full head-to-toe outfit

- [ ]  Crop anchors to the top of the frame (feet always visible)

- [ ]  Fix applied to PDP and product cards wherever 9×16 videos appear

- [ ]  Ideal is no cropping of head or feet on any breakpoint. However, if cropping, occurs, bottom align so outfit plus shoes are not cropped. Ok to have model's head cropped.

- [ ]  Tested desktop and mobile

# Dev Notes

 Adjust `object-position` CSS on the video container for 9:16 aspect ratio videos. Current likely value is `center` (cropping both ends); change to `top` to anchor the crop to the top of the frame, keeping the full lower body visible. Check both PDP and PLP video containers. 

# Estimation Notes

 **Hours Estimate:** 3–5 hrs | **Confidence:** 🟡 Medium — straightforward CSS but needs testing across all video placements

 **Subtask Breakdown:**

-  Identify all 9×16 video container selectors in theme: 0.5–1 hr

-  Update object-position to top: 0.5 hr

-  QA across PDP and PLP, desktop + mobile: 1–2 hrs

-  Edge-case testing (very tall / short videos): 0.5–1 hr

 **Assumptions / Risks:**

-  Videos are rendered with a consistent CSS class across PDP and PLP

-  Client approves top-anchor crop direction (confirmed May 28)

# Bugs from QA

 R/C - [https://www.elietahari.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=152782930057](https://www.elietahari.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=152782930057)

 test product - [https://www.elietahari.com/products/aurora-halterneck-maxi-dress-2](https://www.elietahari.com/products/aurora-halterneck-maxi-dress-2)

 [https://www.elietahari.com/products/aurora-halterneck-maxi-dress-2?preview_theme_id=152782930057](https://www.elietahari.com/products/aurora-halterneck-maxi-dress-2?preview_theme_id=152782930057)

 ✅ FIXED - cropping of head okay (first video is before Dev fix). Empty space has been removed. See videos below:

[https://roswellstudios-company.monday.com/protected_static/11104640/resources/3018979344/Tahari%20cropped%20vid.mp4](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3018979344/Tahari%20cropped%20vid.mp4)

[https://roswellstudios-company.monday.com/protected_static/11104640/resources/3024785433/ET%20Video.mp4](https://roswellstudios-company.monday.com/protected_static/11104640/resources/3024785433/ET%20Video.mp4)

|  DEV |  QA |  Description |  Notes |
| --- | --- | --- | --- |

# Clarifying Questions

 None — crop direction confirmed on call (top anchor).