# materials.list

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-materials-list

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Materials](/docs/api/materials)
  * materials.list



# materials.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/materials.list

Lists all the materials that match the optional filters provided.

## Request​

  * application/json



### Body

**filter** object

**ids** string[]




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

**Example:**`39c64ba9-ebf1-491a-8486-a0b96ff21c07`

**project** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**group** objectnullable

If `null`, the material is not in any group.

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`nextgenProjectGroup`

**title** string

**Example:**`Metal studs`

**status** string

**Possible values:** [`to_do`, `in_progress`, `on_hold`, `done`]

**Example:**`in_progress`

**billing_method** string

**Possible values:** [`fixed_price`, `unit_price`, `non_billable`]

**Example:**`unit_price`

**billing_status** BillingStatus (string)

**Possible values:** [`not_billable`, `not_billed`, `partially_billed`, `fully_billed`]

**Example:**`not_billable`

**quantity** numbernullable

**quantity_estimated** numbernullable

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

**unit** objectnullable

`null` if the default unit is used

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`priceunit`

**amount_billed** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**external_budget_spent** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**internal_budget** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**fixed_price** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**cost** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin** objectnullable

**amount** numberrequired

**Example:**`123.3`

**currency** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**margin_percentage** numbernullable

`null` if the user does not have access to "Costs on projects"

**assignees** object[]

  * Array [

**assignee** object

**type** string

**Possible values:** [`team`, `user`]

**Example:**`user`

**id** string

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**assign_type** string

**Possible values:** [`manual`]

**Example:**`manual`

  * ]

**start_date** stringnullable

**Example:**`2023-01-18`

**end_date** stringnullable

**Example:**`2023-03-22`

**product** objectnullable

`null` if no product is coupled to the material

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`product`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "eab232c6-49b2-4b7e-a977-5e1148dad471"  
          },  
          "title": "Metal studs",  
          "status": "in_progress",  
          "billing_method": "unit_price",  
          "billing_status": "not_billable",  
          "quantity": null,  
          "quantity_estimated": null,  
          "unit_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit": {  
            "type": "priceunit",  
            "id": "f1b7ae71-b610-02e0-8a10-443c31597e11"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "manual"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "product": {  
            "type": "product",  
            "id": "85fd7319-b094-462a-ae78-ff94d6bcb226"  
          }  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "39c64ba9-ebf1-491a-8486-a0b96ff21c07",  
          "project": {  
            "type": "nextgenProject",  
            "id": "018536c0-bf23-77eb-81f5-10e87cad50bc"  
          },  
          "group": {  
            "type": "nextgenProjectGroup",  
            "id": "eab232c6-49b2-4b7e-a977-5e1148dad471"  
          },  
          "title": "Metal studs",  
          "status": "in_progress",  
          "billing_method": "unit_price",  
          "billing_status": "not_billable",  
          "quantity": null,  
          "quantity_estimated": null,  
          "unit_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit_cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "unit": {  
            "type": "priceunit",  
            "id": "f1b7ae71-b610-02e0-8a10-443c31597e11"  
          },  
          "amount_billed": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "external_budget_spent": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "internal_budget": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "fixed_price": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "cost": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin": {  
            "amount": 123.3,  
            "currency": "EUR"  
          },  
          "margin_percentage": null,  
          "assignees": [  
            {  
              "assignee": {  
                "type": "user",  
                "id": "66abace2-62af-0836-a927-fe3f44b9b47b"  
              },  
              "assign_type": "manual"  
            }  
          ],  
          "start_date": "2023-01-18",  
          "end_date": "2023-03-22",  
          "product": {  
            "type": "product",  
            "id": "85fd7319-b094-462a-ae78-ff94d6bcb226"  
          }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/materials.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"ids\": [\n      \"46156648-87c6-478d-8aa7-1dc3a00dacab\",\n      \"46156648-87c6-478d-8aa7-1dc3a00daca4\"\n    ]\n  }\n}", null, "application/json");  
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
      "filter": {
        "ids": [
          "46156648-87c6-478d-8aa7-1dc3a00dacab",
          "46156648-87c6-478d-8aa7-1dc3a00daca4"
        ]
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
