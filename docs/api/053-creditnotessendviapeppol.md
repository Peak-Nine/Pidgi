# creditNotes.sendViaPeppol

> Source: https://developer.focus.teamleader.eu/docs/api/credit-notes-send-via-peppol

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Credit Notes](/docs/api/credit-notes)
  * creditNotes.sendViaPeppol



# creditNotes.sendViaPeppol
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/creditNotes.sendViaPeppol

Send a credit note via the Peppol network.

## Request​

  * application/json



### Body

**id** stringrequired

**Example:**`018d5965-19fb-701a-af11-e80451931551`




## Responses​

  * 204



No Content

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/creditNotes.sendViaPeppol");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"018d5965-19fb-701a-af11-e80451931551\"\n}", null, "application/json");  
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
      "id": "018d5965-19fb-701a-af11-e80451931551"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
