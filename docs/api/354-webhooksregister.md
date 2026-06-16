# webhooks.register

> Source: https://developer.focus.teamleader.eu/docs/api/webhooks-register

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Webhooks](/docs/api/webhooks)
  * webhooks.register



# webhooks.register
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/webhooks.register

Register a new webhook.

## Request​

  * application/json



### Body**required**

**url** stringrequired

Your webhook URL

**Example:**`https://example.com`

**types** string[]required

Array of event types that fire the webhook

**Possible values:** [`account.deactivated`, `account.deleted`, `call.added`, `call.completed`, `call.deleted`, `call.updated`, `company.added`, `company.deleted`, `company.updated`, `contact.added`, `contact.deleted`, `contact.linkedToCompany`, `contact.unlinkedFromCompany`, `contact.updatedLinkToCompany`, `contact.updated`, `creditNote.booked`, `creditNote.deleted`, `creditNote.peppolSubmissionFailed`, `creditNote.peppolSubmissionSucceeded`, `creditNote.sent`, `creditNote.updated`, `deal.created`, `deal.deleted`, `deal.lost`, `deal.moved`, `deal.updated`, `deal.won`, `incomingCreditNote.added`, `incomingCreditNote.approved`, `incomingCreditNote.bookkeepingSubmissionFailed`, `incomingCreditNote.bookkeepingSubmissionSucceeded`, `incomingCreditNote.deleted`, `incomingCreditNote.refused`, `incomingCreditNote.updated`, `incomingInvoice.added`, `incomingInvoice.approved`, `incomingInvoice.bookkeepingSubmissionFailed`, `incomingInvoice.bookkeepingSubmissionSucceeded`, `incomingInvoice.deleted`, `incomingInvoice.refused`, `incomingInvoice.updated`, `invoice.booked`, `invoice.deleted`, `invoice.drafted`, `invoice.paymentRegistered`, `invoice.paymentRemoved`, `invoice.peppolSubmissionFailed`, `invoice.peppolSubmissionSucceeded`, `invoice.sent`, `invoice.updated`, `meeting.created`, `meeting.completed`, `meeting.deleted`, `meeting.updated`, `milestone.created`, `milestone.updated`, `nextgenProject.created`, `nextgenProject.updated`, `nextgenProject.closed`, `nextgenProject.deleted`, `nextgenTask.completed`, `nextgenTask.created`, `nextgenTask.deleted`, `nextgenTask.updated`, `product.added`, `product.updated`, `product.deleted`, `project.created`, `project.deleted`, `project.updated`, `receipt.added`, `receipt.approved`, `receipt.bookkeepingSubmissionFailed`, `receipt.bookkeepingSubmissionSucceeded`, `receipt.deleted`, `receipt.refused`, `receipt.updated`, `subscription.added`, `subscription.deactivated`, `subscription.deleted`, `subscription.updated`, `task.completed`, `task.created`, `task.deleted`, `task.updated`, `ticket.closed`, `ticket.created`, `ticket.deleted`, `ticket.reopened`, `ticket.updated`, `ticketMessage.added`, `timeTracking.added`, `timeTracking.deleted`, `timeTracking.updated`, `user.deactivated`]




## Responses​

  * 204



**Response Headers**




#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/webhooks.register");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"url\": \"https://example.com\",\n  \"types\": [\n    \"account.deactivated\"\n  ]\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required
    
    
    {
      "url": "https://example.com",
      "types": [
        "account.deactivated"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
