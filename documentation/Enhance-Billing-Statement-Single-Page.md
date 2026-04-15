# Enhancements: Billing Statement & Single Page Room Grouping

This document outlines the recent user prompts and the corresponding solutions implemented to enhance the receipt generation (`Step 5`) and the "All Rooms" view on the Single Page.

## 1. Billing Statement (Receipt) Enhancements

**Prompt:** _"in the billing statement or in the step 5, if the booking type is venue, the check in and check out will display there(receipt). it will be located below the event type(meeting, wedding, birthday) on the right side. dont make it too big, just enough to read. the default check in and check out time for that is 8am - 12am."_

**Follow-up Prompt:** _"okay just emphasize it, make it noticeable but dont make it too big that other elements cant be seen"_

**Follow-up Prompt:** _"can you make it in the center of the receipt not just in the left part of the whole receipt?"_

**Solution implemented:**

- In `src/pages/Booking/Steps/Step5.tsx`, a specific condition checks if the `bookingType` is `"venue"`.
- A small text block styled as an emphasized badge (amber text with subtle background) was placed directly in the center, between the booking summaries and the line items table.
- The text displayed is: `*Check-in time: 8:00 AM - Check-out time: 12:00 AM`.

## 2. Dynamic Room Grouping in Single Page

**Prompt:** _"in the single pag view, u can see below that there are all rooms. i want the rooms there to be grouped by type(so there are four). the only thing is standard has two diffrent bed spicifications. so it will be displayed standard(2), family(1), deluxe(1)"_

**Solution implemented:**

- In `src/pages/SinglePage.tsx`, the `visibleList` array (which originally displayed every individual room) was transformed into `groupedVisibleList`.
- Rooms are now grouped by a unique combination of `type` and `bed_specifications`.
- Instead of showing redundant repeating cards (e.g., standard room 1, standard room 2, standard room 3... ), the "All rooms" catalog now cleanly maps down to the unique offerings.
- The map logic automatically sums up exactly how many properties match that unique group combination, passing it as a `groupCount` variable.

## 3. Card Item Availability Count

**Prompt:** _"in the cards there, it should be showing how many are there that are grouped, or how many are available"_

**Follow-up Prompt:** _"no, dont put it inside the badge"_

**Solution implemented:**

- The updated count is now consumed by the `CardItem.tsx` component via the `groupCount` prop.
- To ensure it does not cram the generic `RoomTypeBadge`, it runs independently in its own separate pill on the right side of the card's header title/badge wrapper.
- Users will clearly read it as `<Count> available` (i.e. **"2 available"**) isolated from the main component's styling details.
