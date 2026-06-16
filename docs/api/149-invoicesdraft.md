# invoices.draft

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-draft

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.draft



# invoices.draft
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.draft

Draft a new invoice.

## Request​

  * application/json



### Body**required**

**invoicee** objectrequired

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**for_attention_of** object

oneOf

    * By Name
    * By Contact Id

**name** stringrequired

**Example:**`Finance Dept.`

**contact_id** stringrequired

**Example:**`417a2231-c3c7-4e1c-a6bb-1b014836ca60`

**department_id** stringrequired

**Example:**`cef01135-7e51-4f6f-a6eb-6e5e5a885ac7`

**payment_term** objectrequired

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**currency** object

**code** CurrencyCode (string)required

**Possible values:** [`BAM`, `CAD`, `CHF`, `CLP`, `CNY`, `COP`, `CZK`, `DKK`, `EUR`, `GBP`, `INR`, `ISK`, `JPY`, `MAD`, `MXN`, `NOK`, `PEN`, `PLN`, `RON`, `SEK`, `TRY`, `USD`, `ZAR`]

**exchange_rate** number

**Example:**`1.1238`

**project_id** string

**Example:**`624ca743-8998-4f8c-add1-c427bb022166`

**purchase_order_number** string

**Example:**`000023`

**grouped_lines** object[]required

  * Array [

**section** object

**title** stringrequired

**line_items** object[]required

  * Array [

**quantity** numberrequired

**Example:**`3`

**description** stringrequired

**Example:**`An awesome product`

**extended_description** stringnullable

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**unit_price** object

**amount** numberrequired

**Example:**`123.3`

**tax** stringrequired

**Possible values:** [`excluding`]

**Example:**`excluding`

**tax_rate_id** stringrequired

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585823`

**discount** object

**value** numberrequired

**Example:**`10`

**type** stringrequired

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**product_id** string

**Example:**`d905ff57-e866-0f59-9d1e-1fd4538bfae1`

**withholding_tax_rate_id** string

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585824`

**product_category_id** string

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`

  * ]

  * ]

**invoice_date** string

**Example:**`2016-02-04`

**discounts** object[]

  * Array [

**type** string

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**value** number

**Example:**`15.5`

**description** string

**Example:**`winter promotion`

  * ]

**note** string

**Example:**`Invoice comments`

**expected_payment_method** objectnullable

oneOf

    * With method & reference
    * With method only

**method** string

**Possible values:** [`sepa_direct_debit`, `direct_debit`, `credit_card`]

**Example:**`sepa_direct_debit`

**reference** stringnullable

**Example:**`AB1234`

**method** string

**Possible values:** [`cash`, `cheque`, `bankers_draft`, `bank_transfer`, `payment_card`]

**Example:**`cash`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]

**document_template_id** string

**Example:**`179e1564-493b-4305-8c54-a34fc80920fc`

**delivery_date** stringnullable

**Example:**`2025-12-08`




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
        "type": "invoice",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "invoice",  
        "id": "e4bf74ca-e900-471f-84b1-276e5d3afae4"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.draft");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"invoicee\": {\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    },\n    \"for_attention_of\": {\n      \"name\": \"Finance Dept.\"\n    }\n  },\n  \"department_id\": \"cef01135-7e51-4f6f-a6eb-6e5e5a885ac7\",\n  \"payment_term\": {\n    \"type\": \"cash\",\n    \"days\": 0\n  },\n  \"currency\": {\n    \"code\": \"BAM\",\n    \"exchange_rate\": 1.1238\n  },\n  \"project_id\": \"624ca743-8998-4f8c-add1-c427bb022166\",\n  \"purchase_order_number\": \"000023\",\n  \"grouped_lines\": [\n    {\n      \"section\": {\n        \"title\": \"string\"\n      },\n      \"line_items\": [\n        {\n          \"quantity\": 3,\n          \"description\": \"An awesome product\",\n          \"extended_description\": \"Some more information about this awesome product\",\n          \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n          \"unit_price\": {\n            \"amount\": 123.3,\n            \"tax\": \"excluding\"\n          },\n          \"tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585823\",\n          \"discount\": {\n            \"value\": 10,\n            \"type\": \"percentage\"\n          },\n          \"product_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n          \"withholding_tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585824\",\n          \"product_category_id\": \"e2314517-3cab-4aa9-8471-450e73449041\"\n        }\n      ]\n    }\n  ],\n  \"invoice_date\": \"2016-02-04\",\n  \"discounts\": [\n    {\n      \"type\": \"percentage\",\n      \"value\": 15.5,\n      \"description\": \"winter promotion\"\n    }\n  ],\n  \"note\": \"Invoice comments\",\n  \"expected_payment_method\": {\n    \"method\": \"sepa_direct_debit\",\n    \"reference\": \"AB1234\"\n  },\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ],\n  \"document_template_id\": \"179e1564-493b-4305-8c54-a34fc80920fc\",\n  \"delivery_date\": \"2025-12-08\"\n}", null, "application/json");  
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
    
    
    {
      "invoicee": {
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        },
        "for_attention_of": {
          "name": "Finance Dept."
        }
      },
      "department_id": "cef01135-7e51-4f6f-a6eb-6e5e5a885ac7",
      "payment_term": {
        "type": "cash",
        "days": 0
      },
      "currency": {
        "code": "BAM",
        "exchange_rate": 1.1238
      },
      "project_id": "624ca743-8998-4f8c-add1-c427bb022166",
      "purchase_order_number": "000023",
      "grouped_lines": [
        {
          "section": {
            "title": "string"
          },
          "line_items": [
            {
              "quantity": 3,
              "description": "An awesome product",
              "extended_description": "Some more information about this awesome product",
              "unit_of_measure_id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71",
              "unit_price": {
                "amount": 123.3,
                "tax": "excluding"
              },
              "tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585823",
              "discount": {
                "value": 10,
                "type": "percentage"
              },
              "product_id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",
              "withholding_tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585824",
              "product_category_id": "e2314517-3cab-4aa9-8471-450e73449041"
            }
          ]
        }
      ],
      "invoice_date": "2016-02-04",
      "discounts": [
        {
          "type": "percentage",
          "value": 15.5,
          "description": "winter promotion"
        }
      ],
      "note": "Invoice comments",
      "expected_payment_method": {
        "method": "sepa_direct_debit",
        "reference": "AB1234"
      },
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ],
      "document_template_id": "179e1564-493b-4305-8c54-a34fc80920fc",
      "delivery_date": "2025-12-08"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
