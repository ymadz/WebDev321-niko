$(document).ready(function () {
  // Event listener for navigation links
  $(".nav-link").on("click", function (e) {
    e.preventDefault(); // Prevent default anchor click behavior
    $(".nav-link").removeClass("link-active"); // Remove active class from all links
    $(this).addClass("link-active"); // Add active class to the clicked link

    let url = $(this).attr("href"); // Get the URL from the href attribute
    window.history.pushState({ path: url }, "", url); // Update the browser's URL without reloading
  });

  // Event listener for the dashboard link
  $("#dashboard-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewAnalytics(); // Call the function to load analytics
  });

  // Event listener for the products link
  $("#products-link").on("click", function (e) {
    e.preventDefault(); // Prevent default behavior
    viewProducts(); // Call the function to load products
  });

  // Determine which page to load based on the current URL
  let url = window.location.href;
  if (url.endsWith("dashboard")) {
    $("#dashboard-link").trigger("click"); // Trigger the dashboard click event
  } else if (url.endsWith("products")) {
    $("#products-link").trigger("click"); // Trigger the products click event
  } else {
    $("#dashboard-link").trigger("click"); // Default to dashboard if no specific page
  }

  // Function to load analytics view
  function viewAnalytics() {
    $.ajax({
      type: "GET", // Use GET request
      url: "view_analtics.php", // URL for the analytics view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area
        loadChart(); // Call function to load the chart
      },
    });
  }

  // Function to load a sales chart using Chart.js
  function loadChart() {
    const ctx = document.getElementById("salesChart").getContext("2d"); // Get context of the chart element
    const salesChart = new Chart(ctx, {
      type: "bar", // Set chart type to bar
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sept",
          "Oct",
          "Nov",
          "Dec",
        ], // Monthly labels
        datasets: [
          {
            label: "Sales", // Label for the dataset
            data: [
              7000, 5500, 5000, 4000, 4500, 6500, 8200, 8500, 9200, 9600, 10000,
              9800,
            ], // Sales data
            backgroundColor: "#EE4C51", // Bar color
            borderColor: "#EE4C51", // Border color
            borderWidth: 1, // Border width
          },
        ],
      },
      options: {
        responsive: true, // Make chart responsive
        scales: {
          y: {
            beginAtZero: true, // Start y-axis at 0
            max: 10000, // Maximum value for y-axis
            ticks: {
              stepSize: 2000, // Set step size for y-axis ticks
            },
          },
        },
      },
    });
  }

  // Function to load products view
  function viewProducts() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../products/view-products.php", // URL for products view
      dataType: "html", // Expect HTML response
      success: function (response) {
        $(".content-page").html(response); // Load the response into the content area

        // Initialize DataTable for product table
        var table = $("#table-products").DataTable({
          dom: "rtp", // Set DataTable options
          pageLength: 10, // Default page length
          ordering: false, // Disable ordering
        });

        // Bind custom input to DataTable search
        $("#custom-search").on("keyup", function () {
          table.search(this.value).draw(); // Search products based on input
        });

        // Bind change event for category filter
        $("#category-filter").on("change", function () {
          if (this.value !== "choose") {
            table.column(3).search(this.value).draw(); // Filter products by selected category
          }
        });

        // Event listener for adding a product
        $("#add-product").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          addProduct(); // Call function to add product
        });

        // Event listener for editing a product
        $(".edit-product").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          editProduct(this.dataset.id); // Call function to add product
        });

        // Event listener for adding stocks
        $(".add-stock").on("click", function (e) {
          e.preventDefault(); // Prevent default behavior
          addStock(this.dataset.id); // Call function to add product
        });
      },
    });
  }

  // Function to show the add product modal
  function editProduct(productId) {
    $.ajax({
      type: "GET", // Use GET request
      url: "../products/edit-product.html", // URL to get product data
      dataType: "html", // Expect JSON response
      success: function (view) {
        fetchCategories(); // Load categories for the select input
        fetchRecord(productId);
        // Assuming 'view' contains the new content you want to display
        $(".modal-container").empty().html(view); // Load the modal view
        $("#staticBackdropedit").modal("show"); // Show the modal
        $("#staticBackdropedit").attr("data-id", productId);

        // Event listener for the add product form submission
        $("#form-edit-product ").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          updateProduct(productId); // Call function to save product
        });
      },
    });
  }

  // Function to show the add product modal
  function addProduct() {
    $.ajax({
      type: "GET", // Use GET request
      url: "../products/add-product.html", // URL for add product view
      dataType: "html", // Expect HTML response
      success: function (view) {
        $(".modal-container").html(view); // Load the modal view
        $("#staticBackdrop").modal("show"); // Show the modal

        fetchCategories(); // Load categories for the select input

        // Event listener for the add product form submission
        $("#form-add-product").on("submit", function (e) {
          e.preventDefault(); // Prevent default form submission
          saveProduct(); // Call function to save product
        });
      },
    });
  }

  // Function to save a new product
  function saveProduct() {
    $.ajax({
      type: "POST", // Use POST request
      url: "../products/add-product.php", // URL for saving product
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.codeErr) {
            $("#code").addClass("is-invalid"); // Mark field as invalid
            $("#code").next(".invalid-feedback").text(response.codeErr).show(); // Show error message
          } else {
            $("#code").removeClass("is-invalid"); // Remove invalid class if no error
          }
          if (response.nameErr) {
            $("#name").addClass("is-invalid");
            $("#name").next(".invalid-feedback").text(response.nameErr).show();
          } else {
            $("#name").removeClass("is-invalid");
          }
          if (response.categoryErr) {
            $("#category").addClass("is-invalid");
            $("#category")
              .next(".invalid-feedback")
              .text(response.categoryErr)
              .show();
          } else {
            $("#category").removeClass("is-invalid");
          }
          if (response.priceErr) {
            $("#price").addClass("is-invalid");
            $("#price")
              .next(".invalid-feedback")
              .text(response.priceErr)
              .show();
          } else {
            $("#price").removeClass("is-invalid");
          }
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdrop").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload products to show new entry
          viewProducts();
        }
      },
    });
  }

  // Function to save a new product
  function updateProduct(productId) {
    $.ajax({
      type: "POST", // Use POST request
      url: `../products/update-product.php?id=${productId}`, // URL for saving product
      data: $("form").serialize(), // Serialize the form data for submission
      dataType: "json", // Expect JSON response
      success: function (response) {
        if (response.status === "error") {
          // Handle validation errors
          if (response.codeErr) {
            $("#code").addClass("is-invalid"); // Mark field as invalid
            $("#code").next(".invalid-feedback").text(response.codeErr).show(); // Show error message
          } else {
            $("#code").removeClass("is-invalid"); // Remove invalid class if no error
          }
          if (response.nameErr) {
            $("#name").addClass("is-invalid");
            $("#name").next(".invalid-feedback").text(response.nameErr).show();
          } else {
            $("#name").removeClass("is-invalid");
          }
          if (response.categoryErr) {
            $("#category").addClass("is-invalid");
            $("#category")
              .next(".invalid-feedback")
              .text(response.categoryErr)
              .show();
          } else {
            $("#category").removeClass("is-invalid");
          }
          if (response.priceErr) {
            $("#price").addClass("is-invalid");
            $("#price")
              .next(".invalid-feedback")
              .text(response.priceErr)
              .show();
          } else {
            $("#price").removeClass("is-invalid");
          }
        } else if (response.status === "success") {
          // On success, hide modal and reset form
          $("#staticBackdropedit").modal("hide");
          $("form")[0].reset(); // Reset the form
          // Optionally, reload products to show new entry
          viewProducts();
        }
      },
    });
  }

  // Function to fetch product categories
  function fetchCategories() {
    $.ajax({
      url: "../products/fetch-categories.php", // URL for fetching categories
      type: "GET", // Use GET request
      dataType: "json", // Expect JSON response
      success: function (data) {
        // Clear existing options and add a default "Select" option
        $("#category").empty().append('<option value="">--Select--</option>');

        // Append each category to the select dropdown
        $.each(data, function (index, category) {
          $("#category").append(
            $("<option>", {
              value: category.id, // Value attribute
              text: category.name, // Displayed text
            })
          );
        });
      },
    });
  }

  function fetchRecord(productId) {
    $.ajax({
      url: `../products/fetch-product.php?id=${productId}`, // URL for fetching categories
      type: "POST", // Use GET request
      dataType: "json", // Expect JSON response
      success: function (product) {
        $("#code").val(product.code);
        $("#name").val(product.name);
        $("#category").val(product.category_id).trigger("change"); // Set the selected category
        $("#price").val(product.price);
      },
    });
  }
});

// Function to show the stock in/out modal
function addStock(productId) {
  $.ajax({
      type: "GET",
      url: "../stocks/stock-in-out.html",
      dataType: "html",
      success: function (view) {
          $(".modal-container").html(view); // Load the modal view
          $("#stockModal").modal("show"); // Show the modal

          // Handle the visibility of the reason field
          $("input[name='status']").on("change", function () {
              if (this.value === "out") {
                  $("#reasonField").removeClass("d-none");
              } else {
                  $("#reasonField").addClass("d-none");
              }
          });

          // Event listener for the stock form submission
          $("#form-stock").on("submit", function (e) {
              e.preventDefault();
              saveStock(productId); // Call function to save stock in/out
          });
      },
  });
}

// Function to save stock in/out data
function saveStock(productId) {
  $.ajax({
      type: "POST",
      url: `../stocks/stocks.php?id=${productId}`,
      data: $("#form-stock").serialize(),
      dataType: "json",
      success: function (response) {
          if (response.status === "error") {
              // Display validation errors
              if (response.quantityErr) {
                  $("#quantity").addClass("is-invalid");
                  $("#quantity").next(".invalid-feedback").text(response.quantityErr).show();
              }
              if (response.statusErr) {
                  $("input[name='status']").addClass("is-invalid");
                  $("input[name='status']").next(".invalid-feedback").text(response.statusErr).show();
              }
              if (response.reasonErr) {
                  $("#reason").addClass("is-invalid");
                  $("#reason").next(".invalid-feedback").text(response.reasonErr).show();
              }
          } else if (response.status === "success") {
              $("#stockModal").modal("hide"); // Hide the modal on success
              viewProducts(); // Refresh the products view to reflect the new stock
          }
      },
  });
}
