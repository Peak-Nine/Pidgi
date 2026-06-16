# paymentTerms.list

> Source: https://developer.focus.teamleader.eu/docs/api/payment-terms-list

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Payment Terms](/docs/api/payment-terms)
  * paymentTerms.list



# paymentTerms.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/paymentTerms.list

Get a list of available payment terms.

## Request​

### Header Parameters

**Content-Type** stringrequired

**Possible values:** [`application/json`]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`c93ddb52-0af8-47d9-8551-441435be66a7`

**type** string
    * `cash` \- Direct payment, often cash.
    * `end_of_month` \- End of the month of Xth day after the invoice date.
    * `after_invoice_date` \- X days after invoice date.

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

  * ]

**meta** object

**default** string

**Example:**`c93ddb52-0af8-47d9-8551-441435be66a7`



    
    
    {  
      "data": [  
        {  
          "id": "c93ddb52-0af8-47d9-8551-441435be66a7",  
          "type": "cash"  
        }  
      ],  
      "meta": {  
        "default": "c93ddb52-0af8-47d9-8551-441435be66a7"  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "c93ddb52-0af8-47d9-8551-441435be66a7",  
          "type": "cash"  
        }  
      ],  
      "meta": {  
        "default": "c93ddb52-0af8-47d9-8551-441435be66a7"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/paymentTerms.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Parameters

Content-Type — headerrequired

\---application/json

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
