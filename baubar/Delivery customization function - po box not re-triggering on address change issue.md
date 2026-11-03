We're reporting an issue with the Delivery Customization Function where the function fails to re-execute when a buyer edits certain shipping address fields at checkout, leaving stale delivery options in place. We've isolated the trigger conditions and attached a screen recording so your team can reproduce it directly. The behavior is inconsistent as it sometimes retriggers as expected on the same fields.  
  
**Summary**  
On the first application of a shipping address, our delivery customization function runs as expected and the correct delivery options are shown. However, if the buyer subsequently returns and edits address line 1, address line 2, or city, the function does not consistently re-trigger. The delivery options remain whatever they were after the first run, and the function does not execute again to reflect the updated address.  
  
We are not hiding all delivery options. We want to call this out explicitly because much of the publicly available guidance attributes this class of behavior to functions that hide every delivery option. That is not our case. Our function always leaves at least one delivery option visible. There is never a state in which all options are hidden. The function still fails to re-run on these address edits even with one or more options visible at all times. The "don't hide all options" workaround therefore does not resolve our issue.  
  
**Expected behavior**  
Any change to the shipping address, including address line 1, address line 2, and city, should re-trigger the delivery customization function so the returned operations reflect the current address.  
  
**Actual behavior**  
The function runs correctly on the initial address entry. On a subsequent edit to address line 1, address line 2, or city, the function does not consistently run again. There are no corresponding function execution entries for these edits, and the delivery options shown to the buyer are stale relative to the address now on the checkout. At least one delivery option remains visible throughout, so this is not a hide-all scenario.  
  
**The behavior appears to depend on which field changes:**  
- Editing address line 1, address line 2, or city does NOT consistently re-trigger the function.  
- Editing the state/province or the ZIP/postal code DOES appear to re-trigger the function and refresh the delivery options.  
  
**Steps to reproduce**  
1. Begin a checkout and enter a complete shipping address. Confirm the function runs and returns the expected operations.

  
2. Return to the shipping address and edit only address line 1, address line 2, or city (leaving state/province and ZIP/postal code unchanged).

  
3. Observe that the delivery options do not update and that no new function execution is recorded, despite at least one option being visible the entire time.

  
4. For contrast, edit the state/province or ZIP/postal code and observe that the function does re-run and the options refresh.  
  
A screen recording demonstrating this behavior:  
[https://drive.google.com/file/d/175uTi3L02mw4J4Atg7OngM8-sa8eZuze/view?usp=sharing](https://drive.google.com/file/d/175uTi3L02mw4J4Atg7OngM8-sa8eZuze/view?usp=sharing)  
  
**Environment / details**  
- Function type: Delivery Customization (target: cart.delivery-options.transform.run)  
- Delivery customization status: active  
- Function API version: 2026-04  
- Function Handle: delivery-po-box-validation  
  
We'd appreciate confirmation of whether this is a known issue and any guidance on a timeline or recommended workaround.  
  
Please let us know if there is additional information that you require.