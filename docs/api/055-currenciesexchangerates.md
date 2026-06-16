# currencies.exchangeRates

> Source: https://developer.focus.teamleader.eu/docs/api/currencies-exchange-rates

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Currencies](/docs/api/currencies)
  * currencies.exchangeRates



# currencies.exchangeRates
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/currencies.exchangeRates

Get a list of exchange rates for a provided currency.

## Request​

  * application/json



### Body**required**

**base** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]




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

**code** CurrencyCode (string)

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**symbol** string

**Example:**`$`

**name** string

**Example:**`US Dollar`

**exchange_rate** number

The exchange rate from the provided base currency to the listed currency

**Example:**`1.1238`

  * ]



    
    
    {  
      "data": [  
        {  
          "code": "USD",  
          "symbol": "$",  
          "name": "US Dollar",  
          "exchange_rate": 1.1238  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "code": "USD",  
          "symbol": "$",  
          "name": "US Dollar",  
          "exchange_rate": 1.1238  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/currencies.exchangeRates");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"base\": \"EUR\"\n}", null, "application/json");  
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
      "base": "EUR"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
