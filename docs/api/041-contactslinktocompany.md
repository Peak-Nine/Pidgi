# contacts.linkToCompany

> Source: https://developer.focus.teamleader.eu/docs/api/contacts-link-to-company

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Contacts](/docs/api/contacts)
  * contacts.linkToCompany



# contacts.linkToCompany
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/contacts.linkToCompany

Link a contact to a company.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`75596038-b9c8-4a37-969d-61059e300a28`

**company_id** stringrequired

**Example:**`4da20f00-0628-4336-b885-aa90e580dd85`

**position** string

**Example:**`CEO`

**decision_maker** boolean

**Example:**`true`




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/contacts.linkToCompany");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"75596038-b9c8-4a37-969d-61059e300a28\",\n  \"company_id\": \"4da20f00-0628-4336-b885-aa90e580dd85\",\n  \"position\": \"CEO\",\n  \"decision_maker\": true\n}", null, "application/json");  
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
      "id": "75596038-b9c8-4a37-969d-61059e300a28",
      "company_id": "4da20f00-0628-4336-b885-aa90e580dd85",
      "position": "CEO",
      "decision_maker": true
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
