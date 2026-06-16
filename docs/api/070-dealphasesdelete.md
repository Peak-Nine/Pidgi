# dealPhases.delete

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-delete

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.delete



# dealPhases.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.delete

Delete a phase.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`

**new_phase_id** string

Phase to migrate deals to

**Example:**`29648aea-52f9-09f7-8e1e-cc5c08b4c742`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f350e48a-fbc3-0a79-e62a-53aa1ae86d44\",\n  \"new_phase_id\": \"29648aea-52f9-09f7-8e1e-cc5c08b4c742\"\n}", null, "application/json");  
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
      "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44",
      "new_phase_id": "29648aea-52f9-09f7-8e1e-cc5c08b4c742"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
