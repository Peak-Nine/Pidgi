# dealPipelines.delete

> Source: https://developer.focus.teamleader.eu/docs/api/deal-pipelines-delete

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Pipelines](/docs/api/deal-pipelines)
  * dealPipelines.delete



# dealPipelines.delete
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPipelines.delete

Delete a deal pipeline.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`

**migrate_phases** object[]

Array of phase ids to migrate deals to

  * Array [

**old_phase_id** stringrequired

**Example:**`57785244-0d45-0f01-9c18-5ce1cb68e4c1`

**new_phase_id** stringrequired

**Example:**`29648aea-52f9-09f7-8e1e-cc5c08b4c742`

  * ]




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPipelines.delete");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f350e48a-fbc3-0a79-e62a-53aa1ae86d44\",\n  \"migrate_phases\": [\n    {\n      \"old_phase_id\": \"57785244-0d45-0f01-9c18-5ce1cb68e4c1\",\n      \"new_phase_id\": \"29648aea-52f9-09f7-8e1e-cc5c08b4c742\"\n    }\n  ]\n}", null, "application/json");  
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
      "migrate_phases": [
        {
          "old_phase_id": "57785244-0d45-0f01-9c18-5ce1cb68e4c1",
          "new_phase_id": "29648aea-52f9-09f7-8e1e-cc5c08b4c742"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
