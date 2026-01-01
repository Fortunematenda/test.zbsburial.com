import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, Title, Paragraph } from 'react-native-paper';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Something went wrong</Title>
              <Paragraph>
                An unexpected error occurred. You can try again.
              </Paragraph>
              <Text style={styles.errorText}>
                {this.state.error?.message || 'Unknown error'}
              </Text>
              <Button
                mode="contained"
                onPress={this.handleRetry}
                style={styles.button}
              >
                Retry
              </Button>
            </Card.Content>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    color: '#B00020',
  },
});

export default ErrorBoundary;


