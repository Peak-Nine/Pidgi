# dealPhases.move

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-move

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.move



# dealPhases.move
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.move

Move a phase to a new position in the pipeline.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`

**after_phase_id** stringrequired

**Example:**`22364cbf-971e-022c-811b-a76c28000257`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.move");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f350e48a-fbc3-0a79-e62a-53aa1ae86d44\",\n  \"after_phase_id\": \"22364cbf-971e-022c-811b-a76c28000257\"\n}", null, "application/json");  
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
      "after_phase_id": "22364cbf-971e-022c-811b-a76c28000257"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
