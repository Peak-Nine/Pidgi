# receipts.listPayments

> Source: https://developer.focus.teamleader.eu/docs/api/receipts-list-payments

  * [](/)
  * [API Reference](/docs/api)
  * Expenses
  * [Receipts](/docs/api/receipts)
  * receipts.listPayments



# receipts.listPayments
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/receipts.listPayments

List payments for a(n incoming) receipt.

## Request​

  * application/json



### Body**required**

**id** stringrequired




## Responses​

  * 200



OK

  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**payment** object

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**paid_at** date-time

**payment_method** objectnullable

**type** string

**id** string

**remark** stringnullable

  * ]

**meta** object

**total** object

**amount** number



    
    
    {  
      "data": [  
        {  
          "id": "string",  
          "payment": {  
            "amount": 123.3,  
            "currency": "BAM"  
          },  
          "paid_at": "2024-07-29T15:51:28.071Z",  
          "payment_method": {  
            "type": "string",  
            "id": "string"  
          },  
          "remark": "string"  
        }  
      ],  
      "meta": {  
        "total": {  
          "amount": 0  
        }  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "018d5965-19fb-701a-af11-e80451931551",  
          "payment": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "paid_at": "2016-03-03T16:44:33+00:00",  
          "payment_method": {  
            "type": "paymentMethod",  
            "id": "bb9589ec-6e08-0d5f-9b23-7be9b9c3ea2d"  
          },  
          "remark": "This is a remark"  
        }  
      ],  
      "meta": {  
        "total": {  
          "amount": 123.3  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/receipts.listPayments");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"string\"\n}", null, "application/json");  
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
      "id": "string"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
