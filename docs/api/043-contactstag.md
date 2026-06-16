# contacts.tag

> Source: https://developer.focus.teamleader.eu/docs/api/contacts-tag

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Contacts](/docs/api/contacts)
  * contacts.tag



# contacts.tag
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/contacts.tag

Add a new or existing tag to a contact.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`cadd94ba-a41e-4eb4-a46e-39a7f6f96070`

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/contacts.tag");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"cadd94ba-a41e-4eb4-a46e-39a7f6f96070\",\n  \"tags\": [\n    \"prospect\",\n    \"expo\"\n  ]\n}", null, "application/json");  
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
      "id": "cadd94ba-a41e-4eb4-a46e-39a7f6f96070",
      "tags": [
        "prospect",
        "expo"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
