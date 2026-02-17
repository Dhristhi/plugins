---
'@dhristhi/react-form-builder': minor
---

Features:

- "Added code to club integer and number, checkbox and multi checkbox."
- "Renamed and changed placement of apply change button."
- "Added dynamic api call for public Api to get enum options instead of default enum options."
- "Added condition to switch between dynamic api call to default enum options in field properties and Respective multilingual changes.
- "Added Currency support to the number field."
  - "Added toggle button to use number field as a currency."
  - "Added currency :true and format :currency properties in uischema."
  - "Multilingual support for currency."
  - "Add props to accept currency icon from user."

  Bugs:

- "Tooltip is not visible for Setting icons."
- "When we disable any fields/ layout from Left side bar , its still visible in Basic Properties - Field type."
- "When we hide all the fields and then select any layout and click on no field yet , then number field is still appears in the layouts(horizontal , vertical and in group also)."
- "Invalid value issue fixed for select, checkbox and radio."
- "Fixed date-range field validation and default value handling."
- "Removed the default value as a textfield and maked it a dropdown to show a enum values."
- "Added condition to prevent duplicate enum values."
- "From array field remove the multi select and multi checkbox."
  - "Remove the layouts from horizontal layout and vice versa."
- "While removing the From Fields , the tick mark symbol should be there but there was ( - ). symbol, and when we remove all the fields the ( - ) is still there."
- "Enhance currency input handling and add delete confirmation messages in localization."
  - "Added toggle button handling condition for number and integer for field key and field type."
  - "Added array field delete dialog confirmation messages in localization."
  - "Enhance currency input , now can add the decimal as well in a currency input."
