# migrate.id

> Source: https://developer.focus.teamleader.eu/docs/api/migrate-id

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Migrating](/docs/api/migrating)
  * migrate.id



# migrate.id
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/migrate.id

Translates an ID from the deprecated API into a new UUID.

## Request​

  * application/json



### Body**required**

**type** string

**Possible values:** [`account`, `user`, `department`, `product`, `contact`, `company`, `deal`, `dealPhase`, `project`, `milestone`, `task`, `meeting`, `call`, `ticket`, `invoice`, `creditNote`, `subscription`, `quotation`, `timeTracking`, `customField`]

**Example:**`contact`

**id** number

**Example:**`1`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**type** string

**Possible values:** [`account`, `user`, `department`, `product`, `contact`, `company`, `deal`, `dealPhase`, `project`, `milestone`, `todo`, `event`, `ticket`, `invoice`, `creditNote`, `subscription`, `quotation`, `timeTracking`, `customField`]

**Example:**`contact`

**id** string

**Example:**`6ad54ec6-ee2d-4500-afe6-0917c1aa7a38`



    
    
    {  
      "data": {  
        "type": "contact",  
        "id": "6ad54ec6-ee2d-4500-afe6-0917c1aa7a38"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "contact",  
        "id": "6ad54ec6-ee2d-4500-afe6-0917c1aa7a38"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/migrate.id");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"type\": \"contact\",\n  \"id\": 1\n}", null, "application/json");  
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
      "type": "contact",
      "id": 1
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
