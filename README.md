# axis-hackathon-prototype-2018
Freesoul's voice enabled prototype for axis-hackathon 2018

This is a simple login system that allows you to authenticate user through their voice.
Apart from this, user needs to go through  : Username verification -> Voice Identification on login for security reasons.
After getting the access to dashboard, we can't use the Identification for all Transactions, as it is less secure for transaction in bank.
So, We tried implementing User verification there. For this user has to go through : Opt for Online Transaction -> Payment
once user opted himself for online transaction , for each and every transaction he wants to initiate should be verified by the voice
of the same user with the same phrase.

Devlopment Environment:

.Net Framwork : 4.5.2
Entity Framework : 6.0.0.0
Reliable Internet connectivity


+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

It uses default http://localhost:65482/
if not and you get any error regarding file or page not found 
replace the above url with your current IIS Port.
in - Login.cshtml and Freesoul.js file
