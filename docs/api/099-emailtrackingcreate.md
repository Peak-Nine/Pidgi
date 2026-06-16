# emailTracking.create

> Source: https://developer.focus.teamleader.eu/docs/api/email-tracking-create

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Email Tracking](/docs/api/email-tracking)
  * emailTracking.create



# emailTracking.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/emailTracking.create

Create a new email tracking.

## Request​

  * application/json



### Body**required**

**subject** objectrequired

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** EmailTrackingSubjectTypes (string)required

**Possible values:** [`contact`, `company`, `deal`, `invoice`, `creditNote`, `subscription`, `product`, `quotation`, `nextgenProject`]

**title** string

**Example:**`an email subject`

**content** stringrequired

**Example:**`<p>the contents of the received email</p>`

**attachments** string[]

All files must have the same subject as the email tracking subject




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "emailTracking",  
        "id": "91e99ae3-16f9-01d7-9046-9a501cb2155f"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "emailTracking",  
        "id": "91e99ae3-16f9-01d7-9046-9a501cb2155f"  
      }  
    }  
    

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/emailTracking.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"subject\": {\n    \"type\": \"contact\",\n    \"id\": \"36386b05-936e-4cc0-9523-bd20d797ebf5\"\n  },\n  \"title\": \"an email subject\",\n  \"content\": \"<p>the contents of the received email</p>\",\n  \"attachments\": [\n    \"4f4288b2-c21b-4dac-87f6-a97511309079\"\n  ]\n}", null, "application/json");  
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

  * Example (from schema)
  * Example


    
    
    {
      "subject": {
        "type": "contact",
        "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"
      },
      "title": "an email subject",
      "content": "<p>the contents of the received email</p>",
      "attachments": [
        "4f4288b2-c21b-4dac-87f6-a97511309079"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
