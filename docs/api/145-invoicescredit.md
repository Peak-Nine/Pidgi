# invoices.credit

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-credit

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.credit



# invoices.credit
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.credit

Credit an invoice completely.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`d885e5d5-bacb-4607-bde9-abc4a04a901b`

**credit_note_date** string

**Example:**`2016-02-04`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "creditNote",  
        "id": "d885e5d5-bacb-4607-bde9-abc4a04a901c"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "creditNote",  
        "id": "d885e5d5-bacb-4607-bde9-abc4a04a901c"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.credit");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"d885e5d5-bacb-4607-bde9-abc4a04a901b\",\n  \"credit_note_date\": \"2016-02-04\"\n}", null, "application/json");  
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
      "id": "d885e5d5-bacb-4607-bde9-abc4a04a901b",
      "credit_note_date": "2016-02-04"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
