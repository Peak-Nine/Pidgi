# ticketStatus.list

> Source: https://developer.focus.teamleader.eu/docs/api/ticket-status-list

  * [](/)
  * [API Reference](/docs/api)
  * Tickets
  * [Ticket Status](/docs/api/ticket-status)
  * ticketStatus.list



# ticketStatus.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/ticketStatus.list

Get a list of ticket statuses.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`46156648-87c6-478d-8aa7-1dc3a00dacab`

**status** string

**Possible values:** [`new`, `open`, `waiting_for_client`, `escalated_thirdparty`, `closed`, `custom`]

**Example:**`new`

**label** string

Only available for `custom` type of status.

**Example:**`Custom Label`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "46156648-87c6-478d-8aa7-1dc3a00dacab",  
          "status": "new",  
          "label": "Custom Label"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "46156648-87c6-478d-8aa7-1dc3a00dacab",  
          "status": "new",  
          "label": "Custom Label"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/ticketStatus.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n      \"46156648-87c6-478d-8aa7-1dc3a00daca4\"\n    ]\n  }\n}", null, "application/json");  
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
        "ids": [
          "46156648-87c6-478d-8aa7-1dc3a00dacab",
          "46156648-87c6-478d-8aa7-1dc3a00daca4"
        ]
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
