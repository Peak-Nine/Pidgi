# bookkeepingSubmissions.list

> Source: https://developer.focus.teamleader.eu/docs/api/bookkeeping-submissions-list

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Bookkeeping Submissions](/docs/api/bookkeeping-submissions)
  * bookkeepingSubmissions.list



# bookkeepingSubmissions.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/bookkeepingSubmissions.list

List all bookkeeping submissions belonging to a specific financial document id and type

## Request​

  * application/json



### Body

**filter** object

**subject** objectrequired

**id** string

UUID of the financial document

**type** string

**Possible values:** [`incoming_invoice`, `incoming_credit_note`, `receipt`]




## Responses​

  * 200



OK

**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

UUID of the Bookkeeping Submission

**subject** object

**id** string

**type** string

**Possible values:** [`incoming_invoice`, `incoming_credit_note`, `receipt`]

**email_address** string

email address where the bookkeeping submission was sent

**status** string

the current status of the bookkeeping submission

**Possible values:** [`sending`, `confirmed`, `failed`]

**created_at** string

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "string",  
          "subject": {  
            "id": "string",  
            "type": "incoming_invoice"  
          },  
          "email_address": "string",  
          "status": "sending",  
          "created_at": "string"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "018d5965-19fb-701a-af11-e80451931551",  
          "subject": {  
            "id": "018d5965-19fb-701a-af11-e80451931551",  
            "type": "incoming_invoice"  
          },  
          "email_address": "john.doe@example.com",  
          "status": "sending",  
          "created_at": "2025-02-26 15:56:40"  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/bookkeepingSubmissions.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"subject\": {\n      \"id\": \"string\",\n      \"type\": \"incoming_invoice\"\n    }\n  }\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "filter": {
        "subject": {
          "id": "string",
          "type": "incoming_invoice"
        }
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
