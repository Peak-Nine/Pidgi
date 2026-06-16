# materials.create

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-materials-create

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Materials](/docs/api/materials)
  * materials.create



# materials.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/materials.create

Create a material. All properties except for `title` and `project_id` are optional.

## Request​

  * application/json



### Body**required**

**project_id** stringrequired

**Example:**`49b403be-a32e-0901-9b1c-25214f9027c6`

**title** stringrequired

**Example:**`Some material`

**group_id** string

If omitted the material is not added to a group.

**Example:**`0185968b-2c9e-73fd-9ce1-a12c0979783b`

**after_id** stringnullable

If `after_id` is null, material is placed on top of the project/group. If `after_id` is not provided, material is placed at the bottom of the project/group.

**Example:**`8ba797aa-107d-4934-9511-2a043bf3f766`

**description** string

**Example:**`Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.`

**billing_method** string

**Possible values:** [`fixed_price`, `unit_price`, `non_billable`]

**Example:**`unit_price`

**quantity** number

**quantity_estimated** number

**unit_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**unit_id** string

**Example:**`69cbfbf2-fefe-4f03-9269-3ddc79117f4d`

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**start_date** string

**Example:**`2023-01-18`

**end_date** string

**Example:**`2023-03-22`

**product_id** string

**Example:**`1c5cf7a1-7248-469c-9dcd-9f0581321ec2`

**assignees** object[]

  * Array [

**type** stringrequired

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

  * ]




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
        "type": "nextgenMaterial",  
        "id": "b275487e-47d9-40b4-9cfe-5dfef77f4954"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenMaterial",  
        "id": "b275487e-47d9-40b4-9cfe-5dfef77f4954"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/materials.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"project_id\": \"49b403be-a32e-0901-9b1c-25214f9027c6\",\n  \"title\": \"Some material\",\n  \"group_id\": \"0185968b-2c9e-73fd-9ce1-a12c0979783b\",\n  \"after_id\": \"8ba797aa-107d-4934-9511-2a043bf3f766\",\n  \"description\": \"Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.\",\n  \"billing_method\": \"unit_price\",\n  \"unit_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"unit_cost\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"unit_id\": \"69cbfbf2-fefe-4f03-9269-3ddc79117f4d\",\n  \"fixed_price\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"external_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"internal_budget\": {\n    \"amount\": 123.3,\n    \"currency\": \"EUR\"\n  },\n  \"start_date\": \"2023-01-18\",\n  \"end_date\": \"2023-03-22\",\n  \"product_id\": \"1c5cf7a1-7248-469c-9dcd-9f0581321ec2\",\n  \"assignees\": [\n    {\n      \"type\": \"user\",\n      \"id\": \"66abace2-62af-0836-a927-fe3f44b9b47b\"\n    }\n  ]\n}", null, "application/json");  
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
      "project_id": "49b403be-a32e-0901-9b1c-25214f9027c6",
      "title": "Some material",
      "group_id": "0185968b-2c9e-73fd-9ce1-a12c0979783b",
      "after_id": "8ba797aa-107d-4934-9511-2a043bf3f766",
      "description": "Protects metal from rust and corrosion, penetrates stuck parts, displaces moisture and lubricates almost anything.",
      "billing_method": "unit_price",
      "unit_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "unit_cost": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "unit_id": "69cbfbf2-fefe-4f03-9269-3ddc79117f4d",
      "fixed_price": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "external_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "internal_budget": {
        "amount": 123.3,
        "currency": "EUR"
      },
      "start_date": "2023-01-18",
      "end_date": "2023-03-22",
      "product_id": "1c5cf7a1-7248-469c-9dcd-9f0581321ec2",
      "assignees": [
        {
          "type": "user",
          "id": "66abace2-62af-0836-a927-fe3f44b9b47b"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
