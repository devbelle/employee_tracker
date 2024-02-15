INSERT INTO departments (department_name)
VALUES ("produce"),
        ("deli"),
        ("customer_associate"),
        ("inventory"),
        ("shift_lead"),
        ("grocery_manager");

INSERT INTO roles (title, salary, department_id)
VALUES ("associate", 23000, 1),
        ("assistant_manager", 38000, 2),
        ("manager", 60000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Kisuke", "Urahara", 3, NULL),
        ("Uryu", "Ishida", 2, 1),
        ("Ichigo", "Kurosaki", 1, 2),
        ("Chad", "Yasutora", 1, 2),
        ("Orihime", "Inoue", 1, 2),
        ("Rukia", "Kuchiki", 1, 2);
        
