# companies.untag

> Source: https://developer.focus.teamleader.eu/docs/api/companies-untag

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Companies](/docs/api/companies)
  * companies.untag



# companies.untag
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/companies.untag

Remove a tag from a company.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`518d2e5e-99bc-4c66-8509-78e6820a1418`

**tags** string[]required




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/companies.untag");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"518d2e5e-99bc-4c66-8509-78e6820a1418\",\n  \"tags\": [\n    \"prospect\",\n    \"expo\"\n  ]\n}", null, "application/json");  
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
      "id": "518d2e5e-99bc-4c66-8509-78e6820a1418",
      "tags": [
        "prospect",
        "expo"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
