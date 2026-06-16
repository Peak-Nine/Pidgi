# companies.uploadLogo

> Source: https://developer.focus.teamleader.eu/docs/api/companies-upload-logo

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Companies](/docs/api/companies)
  * companies.uploadLogo



# companies.uploadLogo
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/companies.uploadLogo

Update the logo of a company.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`4784189d-610b-4488-b3a5-5f324f752417`

**image** stringnullablerequired

Use `null` to remove the logo

**Example:**`data:image/png;base64,0tyZUP4y8ObjsqZnRFhHANZY+Kc=`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/companies.uploadLogo");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"4784189d-610b-4488-b3a5-5f324f752417\",\n  \"image\": \"data:image/png;base64,0tyZUP4y8ObjsqZnRFhHANZY+Kc=\"\n}", null, "application/json");  
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
      "id": "4784189d-610b-4488-b3a5-5f324f752417",
      "image": "data:image/png;base64,0tyZUP4y8ObjsqZnRFhHANZY+Kc="
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
