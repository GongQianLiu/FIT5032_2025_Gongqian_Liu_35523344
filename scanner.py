import socket
import random  # Import random module for randomization
import time    # Import time module for delays

def scan_ports(host, start_port, end_port):
    """
    Scan TCP ports on a given host with randomization and slow scanning features.
    
    Args:
        host (str): Target host IP address
        start_port (int): Starting port number
        end_port (int): Ending port number
    
    Returns:
        list: List of open ports
    """
    
    # --- Randomization of port order implementation ---
    print("Generating and shuffling port list...")
    port_list = list(range(start_port, end_port + 1))  # 1. Create port list
    random.shuffle(port_list)                          # 2. Shuffle list order
    print("Port list has been shuffled, starting scan...")
    
    open_ports = []
    
    # --- Modified loop ---
    for port in port_list:  # 3. Iterate through shuffled list
        
        try:
            # Create socket object
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)  # Set timeout to 1 second
            
            # Attempt to connect to the port
            result = sock.connect_ex((host, port))
            
            if result == 0:
                open_ports.append(port)
                print(f"TCP Port {port}: Open")
            
            sock.close()
            
        except socket.error as e:
            print(f"Error scanning port {port}: {e}")
        
        # --- Slow scanning implementation ---
        delay = random.uniform(0.5, 2.0)  # 4. Generate random delay between 0.5 and 2 seconds
        print(f"Waiting {delay:.2f} seconds...")  # (Optional) Print for debugging
        time.sleep(delay)                  # 5. Pause the program
    
    return open_ports

def main():
    """
    Main function to run the port scanner.
    """
    print("=== TCP Port Scanner with Randomization and Slow Scanning ===")
    
    # Get user input
    host = input("Enter target host IP address: ")
    
    try:
        start_port = int(input("Enter starting port number: "))
        end_port = int(input("Enter ending port number: "))
    except ValueError:
        print("Invalid port numbers. Please enter valid integers.")
        return
    
    # Validate port range
    if start_port < 1 or end_port > 65535 or start_port > end_port:
        print("Invalid port range. Ports must be between 1-65535 and start_port <= end_port.")
        return
    
    print(f"\nStarting scan of {host} from port {start_port} to {end_port}")
    print("Using randomization and slow scanning techniques...\n")
    
    # Perform the scan
    open_ports = scan_ports(host, start_port, end_port)
    
    # Display results
    print(f"\n=== Scan Results ===")
    if open_ports:
        print(f"Found {len(open_ports)} open ports:")
        for port in sorted(open_ports):
            print(f"  Port {port}: Open")
    else:
        print("No open ports found in the specified range.")

if __name__ == "__main__":
    main() 